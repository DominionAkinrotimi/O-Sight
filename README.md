# O-Sight

O-Sight is a sophisticated personal financial analysis and intelligence dashboard. It allows you to upload your bank statements and uses an advanced analysis engine to parse, categorize, and extract deep insights from your raw transaction data.

## 🚀 Key Features

* **Deep Merchant Analytics:** Split-view layout allowing you to drill down into specific payees, seeing your monthly spending trends, exact transaction records, and averages.
* **Income Stability Scoring:** Evaluates the consistency of your income month-over-month, assigning a stability score to help with budgeting.
* **Savings Tracking:** Analyzes how much you're putting away versus withdrawing. Detects transactions to external savings products, breaking down gross vs. net savings.
* **Anomaly Detection:** Flags unusual spending spikes or completely new vendors you've never interacted with before.
* **Recurring Payments Tracker:** Automatically identifies subscriptions and recurring utility payments, calculating your estimated monthly overhead.
* **Smart Parsing:** Specifically designed to unpack messy statement descriptions (e.g., extracting exact network providers like MTN/Glo from generic Airtime/Data purchases).

## 🛠️ Technology Stack

* **Backend:** Python, FastAPI, Pandas
* **Frontend:** React, Vite, Recharts, Lucide Icons

## ⚙️ Installation & Setup

### Prerequisites
* Python 3.9+
* Node.js v18+

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/o-sight.git
cd o-sight
```

### 2. Backend Setup
The backend handles statement parsing and the intelligence engine.

```bash
# Install the required Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m api.main
```
The backend server will run on `http://127.0.0.1:8000`.

### 3. Frontend Setup
The frontend is a modern React application.

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install the Node dependencies
npm install

# Start the Vite development server
npm run dev
```
The application will usually be available at `http://localhost:5173`.

## 📈 Usage
1. Open the frontend in your browser.
2. Drag and drop your bank statement (currently optimized for OPay/standard Nigerian banking statement exports) into the upload area.
3. The intelligence engine will automatically categorize your data and render the dashboard. Navigate through the sidebar to explore Spending, Income, Savings, Insights, and Merchants.
