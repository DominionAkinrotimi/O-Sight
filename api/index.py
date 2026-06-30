import json
import os
import sys
import numpy as np
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from api.parsers.opay import OPayAnalyzer
    from api.engine.intelligence import FinancialIntelligenceEngine
    from api.core.encoders import NpEncoder
except ImportError:
    from parsers.opay import OPayAnalyzer
    from engine.intelligence import FinancialIntelligenceEngine
    from core.encoders import NpEncoder

from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="O-Sight Financial Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Available bank parsers
BANK_PARSERS = {
    "opay": {"name": "OPay", "class": OPayAnalyzer, "status": "active"},
    "gtbank": {"name": "GTBank", "class": None, "status": "coming_soon"},
    "access": {"name": "Access Bank", "class": None, "status": "coming_soon"},
    "firstbank": {"name": "First Bank", "class": None, "status": "coming_soon"},
    "uba": {"name": "UBA", "class": None, "status": "coming_soon"},
    "zenith": {"name": "Zenith Bank", "class": None, "status": "coming_soon"},
    "kuda": {"name": "Kuda", "class": None, "status": "coming_soon"},
    "moniepoint": {"name": "Moniepoint", "class": None, "status": "coming_soon"},
    "palmpay": {"name": "PalmPay", "class": None, "status": "coming_soon"},
}

LATEST_REPORT = None
LATEST_ANALYZER = None

@app.get("/")
@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "O-Sight Financial Intelligence API"}

@app.get("/banks")
@app.get("/api/banks")
async def list_banks():
    """Return list of supported banks and their status."""
    return [{"id": k, "name": v["name"], "status": v["status"]} for k, v in BANK_PARSERS.items()]

@app.post("/analyze")
@app.post("/api/analyze")
async def analyze_statement(
    file: UploadFile = File(...),
    bank_type: str = Form(default="opay")
):
    import tempfile
    import os
    fd, temp_path = tempfile.mkstemp(suffix=".xlsx")
    try:
        # Validate bank type
        bank_info = BANK_PARSERS.get(bank_type)
        if not bank_info:
            os.close(fd)
            os.remove(temp_path)
            return JSONResponse(status_code=400, content={"error": f"Unknown bank: {bank_type}"})
        if bank_info["status"] == "coming_soon":
            os.close(fd)
            os.remove(temp_path)
            return JSONResponse(status_code=400, content={"error": f"{bank_info['name']} parser is coming soon. Currently only OPay is supported."})

        with os.fdopen(fd, "wb") as buffer:
            buffer.write(await file.read())

        # Run parser pipeline with the correct bank analyzer
        AnalyzerClass = bank_info["class"]
        analyzer = AnalyzerClass(temp_path)
        analyzer.run_pipeline()

        # Run intelligence engine
        engine = FinancialIntelligenceEngine(analyzer)
        report = engine.run_all()

        global LATEST_REPORT, LATEST_ANALYZER
        LATEST_REPORT = report
        LATEST_ANALYZER = analyzer

        # Return as JSON (handle numpy types)
        return JSONResponse(
            content=json.loads(json.dumps(report, cls=NpEncoder))
        )
    except Exception as e:
        import traceback
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "traceback": traceback.format_exc()}
        )
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

class FilterParams(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    categories: Optional[List[str]] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None

@app.post("/filter")
@app.post("/api/filter")
async def filter_dashboard(params: FilterParams):
    if not LATEST_ANALYZER:
        return JSONResponse(status_code=400, content={"error": "No statement analyzed yet."})
        
    try:
        df = LATEST_ANALYZER.transactions_parsed.copy()
        
        # Date filter
        if params.start_date:
            df = df[pd.to_datetime(df['Date'], errors='coerce') >= pd.to_datetime(params.start_date)]
        if params.end_date:
            df = df[pd.to_datetime(df['Date'], errors='coerce') <= pd.to_datetime(params.end_date)]
            
        # Category filter
        if params.categories and len(params.categories) > 0:
            df = df[df['Category'].isin(params.categories)]
            
        # Amount filters (applying to absolute value of transaction)
        if params.min_amount is not None:
            df = df[(df['Debit'] >= params.min_amount) | (df['Credit'] >= params.min_amount)]
        if params.max_amount is not None:
            df = df[((df['Debit'] <= params.max_amount) & (df['Debit'] > 0)) | ((df['Credit'] <= params.max_amount) & (df['Credit'] > 0))]
        
        engine = FinancialIntelligenceEngine(
            df=df,
            metadata=LATEST_ANALYZER.metadata,
            computed_totals=LATEST_ANALYZER.computed_totals,
            reported_totals=LATEST_ANALYZER.reported_totals,
            is_balanced=LATEST_ANALYZER.is_balanced,
            discrepancies=LATEST_ANALYZER.discrepancies
        )
        report = engine.run_all()
        
        return JSONResponse(content=json.loads(json.dumps(report, cls=NpEncoder)))
    except Exception as e:
        import traceback
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "traceback": traceback.format_exc()}
        )

@app.get("/admin/quality/latest")
@app.get("/api/admin/quality/latest")
async def get_latest_quality():
    if not LATEST_REPORT:
        return JSONResponse(status_code=404, content={"error": "No reports processed yet"})
    return JSONResponse(content=json.loads(json.dumps(LATEST_REPORT.get("quality_report", {}), cls=NpEncoder)))

@app.get("/admin/audit/merchants")
@app.get("/api/admin/audit/merchants")
async def get_merchant_audit():
    if not LATEST_REPORT:
        return JSONResponse(status_code=404, content={"error": "No reports processed yet"})
    return JSONResponse(content=json.loads(json.dumps(LATEST_REPORT.get("merchant_ranking", []), cls=NpEncoder)))

@app.get("/admin/audit/categories")
@app.get("/api/admin/audit/categories")
async def get_category_audit():
    if not LATEST_REPORT:
        return JSONResponse(status_code=404, content={"error": "No reports processed yet"})
    transactions = LATEST_REPORT.get("transactions", [])
    uncategorized = [t for t in transactions if t.get("Category") in ["Other", "Unknown", ""]]
    return JSONResponse(content=json.loads(json.dumps(uncategorized, cls=NpEncoder)))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Vercel serverless function handler
handler = app
