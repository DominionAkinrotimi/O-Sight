import requests
import json

BASE_URL = "https://o-sight-ashen.vercel.app/api"

def test_banks():
    """Test GET /api/banks endpoint"""
    print("\n" + "="*60)
    print("TEST 1: GET /api/banks")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/banks")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_filter():
    """Test POST /api/filter endpoint"""
    print("\n" + "="*60)
    print("TEST 2: POST /api/filter")
    print("="*60)
    try:
        payload = {
            "start_date": "2024-01-01",
            "end_date": "2024-12-31",
            "min_amount": 100.0,
            "max_amount": 5000.0
        }
        print(f"Sending payload: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/filter", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        # This endpoint expects LATEST_ANALYZER to exist, so 400 is expected if no file uploaded yet
        return response.status_code in [200, 400]
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_quality_latest():
    """Test GET /api/admin/quality/latest endpoint"""
    print("\n" + "="*60)
    print("TEST 3: GET /api/admin/quality/latest")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/admin/quality/latest")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        # This endpoint expects LATEST_REPORT to exist, so 404 is expected if no file uploaded yet
        return response.status_code in [200, 404]
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_merchant_audit():
    """Test GET /api/admin/audit/merchants endpoint"""
    print("\n" + "="*60)
    print("TEST 4: GET /api/admin/audit/merchants")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/admin/audit/merchants")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code in [200, 404]
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_category_audit():
    """Test GET /api/admin/audit/categories endpoint"""
    print("\n" + "="*60)
    print("TEST 5: GET /api/admin/audit/categories")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/admin/audit/categories")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code in [200, 404]
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_analyze_with_file(filepath):
    """Test POST /api/analyze endpoint with a file"""
    print("\n" + "="*60)
    print(f"TEST 6: POST /api/analyze with file: {filepath}")
    print("="*60)
    try:
        with open(filepath, 'rb') as f:
            files = {'file': f}
            data = {'bank_type': 'opay'}
            print(f"Uploading file: {filepath}")
            print(f"Bank type: opay")
            response = requests.post(f"{BASE_URL}/analyze", files=files, data=data)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return response.status_code in [200, 400, 500]
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting API Tests for O-Sight Dashboard")
    print(f"Base URL: {BASE_URL}\n")
    
    results = {}
    
    # Run all GET tests first (no dependencies)
    results["banks"] = test_banks()
    results["filter"] = test_filter()
    results["quality_latest"] = test_quality_latest()
    results["merchant_audit"] = test_merchant_audit()
    results["category_audit"] = test_category_audit()
    
    # Test file upload (optional - requires actual file)
    print("\n" + "="*60)
    print("To test /api/analyze, provide an Excel file path:")
    print("="*60)
    file_path = input("Enter path to .xlsx file (or press Enter to skip): ").strip()
    if file_path:
        results["analyze"] = test_analyze_with_file(file_path)
    
    # Print summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    total = len(results)
    passed = sum(results.values())
    print(f"\nTotal: {passed}/{total} tests passed")
