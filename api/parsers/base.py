import pandas as pd
import numpy as np
from abc import ABC, abstractmethod

class BaseBankAnalyzer(ABC):
    def __init__(self, file_path):
        self.file_path = file_path
        self.raw_df = None
        self.transactions = None
        self.transactions_parsed = None
        self.metadata = {}
        self.reported_totals = {"Total Inflow": 0.0, "Total Outflow": 0.0}
        self.computed_totals = {"Total Inflow": 0.0, "Total Outflow": 0.0}
        self.is_balanced = False
        self.discrepancies = []

    def run_pipeline(self):
        self._load_file()
        self.extract_metadata_and_reported_totals()
        self.extract_transactions_table()
        self.clean_and_parse_transactions()
        self._compute_totals_and_reconcile()
        return self

    def _load_file(self):
        if self.file_path.endswith(('.xlsx', '.xls')):
            self.raw_df = pd.read_excel(self.file_path)
        elif self.file_path.endswith('.csv'):
            self.raw_df = pd.read_csv(self.file_path)
        else:
            raise ValueError("Unsupported file format. Use .xlsx, .xls, or .csv")

    @abstractmethod
    def extract_metadata_and_reported_totals(self): pass

    @abstractmethod
    def extract_transactions_table(self): pass

    @abstractmethod
    def clean_and_parse_transactions(self): pass

    def _clean_currency(self, val):
        if pd.isna(val): return 0.0
        s = str(val).replace('₦', '').replace(',', '').strip()
        if s in ('--', ''): return 0.0
        try: return float(s)
        except ValueError: return 0.0

    def _compute_totals_and_reconcile(self):
        df = self.transactions_parsed
        self.computed_totals['Total Inflow'] = round(df['Credit'].sum(), 2)
        self.computed_totals['Total Outflow'] = round(df['Debit'].sum(), 2)
        inflow_diff = abs(self.computed_totals['Total Inflow'] - self.reported_totals['Total Inflow'])
        outflow_diff = abs(self.computed_totals['Total Outflow'] - self.reported_totals['Total Outflow'])
        self.is_balanced = inflow_diff <= 0.01 and outflow_diff <= 0.01
        if inflow_diff > 0.01:
            self.discrepancies.append(f"Inflow mismatch: Computed ₦{self.computed_totals['Total Inflow']:,.2f} vs Reported ₦{self.reported_totals['Total Inflow']:,.2f} (Δ₦{inflow_diff:,.2f})")
        if outflow_diff > 0.01:
            self.discrepancies.append(f"Outflow mismatch: Computed ₦{self.computed_totals['Total Outflow']:,.2f} vs Reported ₦{self.reported_totals['Total Outflow']:,.2f} (Δ₦{outflow_diff:,.2f})")


# ============================================================
# PART 2: OPAY ANALYZER (Bank-Specific Parser)
# ============================================================
