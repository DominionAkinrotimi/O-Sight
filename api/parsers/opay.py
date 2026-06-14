import pandas as pd
import re
import numpy as np
from api.parsers.base import BaseBankAnalyzer

class OPayAnalyzer(BaseBankAnalyzer):
    def extract_metadata_and_reported_totals(self):
        meta = self.raw_df.iloc[0:5]
        nc = len(meta.columns)
        self.metadata = {
            "Account Name": str(meta.iloc[0, 1]) if nc > 1 else "Unknown",
            "Account Number": str(meta.iloc[0, 3]) if nc > 3 else "Unknown",
            "Account Type": str(meta.iloc[1, 1]) if nc > 1 else "Unknown",
            "Statement Period": str(meta.iloc[1, 3]) if nc > 3 else "Unknown"
        }
        self.reported_totals['Total Outflow'] = self._clean_currency(meta.iloc[2, 3]) if nc > 3 else 0.0
        self.reported_totals['Total Inflow'] = self._clean_currency(meta.iloc[3, 3]) if nc > 3 else 0.0

    def extract_transactions_table(self):
        start_idx = self.raw_df[self.raw_df.iloc[:, 0] == 'Trans. Date'].index[0]
        self.transactions = self.raw_df.iloc[start_idx + 1:].reset_index(drop=True)
        self.transactions.columns = self.raw_df.iloc[start_idx].tolist()
        self.transactions = self.transactions.dropna(subset=['Trans. Date'])

    def clean_and_parse_transactions(self):
        for col in ['Debit(₦)', 'Credit(₦)', 'Balance After(₦)']:
            if col in self.transactions.columns:
                self.transactions[col] = self.transactions[col].apply(self._clean_currency)

        rows = []
        for _, row in self.transactions.iterrows():
            desc = str(row.get('Description', ''))
            debit = row.get('Debit(₦)', 0.0)
            credit = row.get('Credit(₦)', 0.0)
            category, counterparty, bank, narration, account = "Other", "", "", "", ""

            if desc.startswith("Transfer from"):
                parts = [p.strip() for p in desc.split('|')]
                if len(parts) >= 3:
                    counterparty = re.sub(r'^Transfer from\s*', '', parts[0], flags=re.IGNORECASE)
                    bank = parts[1]
                    account = parts[2]
                    narration = parts[3] if len(parts) > 3 else ""
                
                # Check for internal transfer from own accounts
                own_names = ["akinrotimi", "dominion"] # Using user's known name parts
                if "Cowrywise" in desc or any(n in counterparty.lower() for n in own_names):
                    category = "Internal Transfer"
                else:
                    category = "Transfers In"

            elif desc.startswith("Transfer to"):
                parts = [p.strip() for p in desc.split('|')]
                if len(parts) >= 3:
                    counterparty = re.sub(r'^Transfer to\s*', '', parts[0], flags=re.IGNORECASE)
                    bank = parts[1]
                    account = parts[2]
                    narration = parts[3] if len(parts) > 3 else ""
                
                # Check for internal transfer to own accounts
                own_names = ["akinrotimi", "dominion"]
                if "Cowrywise" in desc or any(n in counterparty.lower() for n in own_names):
                    category = "Internal Transfer"
                else:
                    category = "Transfers Out"
            
            # Catch all savings and investments based on keywords, overriding transfer logic if needed
            if any(kw in desc for kw in ["OWealth", "Spend & Save", "Fixed Deposit", "Targets Deposit"]):
                if credit > 0:
                    category = "Savings Withdrawal"
                else:
                    category = "Savings & Investments"
                
                if "OWealth" in desc: counterparty = "OWealth"
                elif "Spend & Save" in desc: counterparty = "Spend & Save"
                elif "Fixed Deposit" in desc: counterparty = "Fixed Deposit"
                elif "Targets" in desc: counterparty = "Targets"
                
            elif any(kw in desc for kw in ["Airtime", "Mobile Data"]):
                category = "Utilities (Airtime/Data)"
                # e.g., "Airtime | 8148190693 | MTN " or "Mobile Data | 8072890967 | DataGlo"
                parts = [p.strip() for p in desc.split('|')]
                if len(parts) >= 3:
                    network_raw = parts[2].lower()
                    if "mtn" in network_raw:
                        counterparty = "MTN"
                    elif "glo" in network_raw:
                        counterparty = "Glo"
                    elif "airtel" in network_raw:
                        counterparty = "Airtel"
                    elif "9mobile" in network_raw:
                        counterparty = "9mobile"
                    else:
                        counterparty = parts[2].replace('Data', '').strip().title()
                    # Append type for clarity if you want "MTN", "Glo" directly
                    # Actually, the user wants "how much I spent on MTN, how much I spent on Glo"
                    # So we'll just use "MTN", "Glo", "Airtel" as counterparty.
                else:
                    if "Airtime" in desc: counterparty = "Airtime Purchase"
                    else: counterparty = "Data Purchase"

            elif any(kw in desc for kw in ["USSD Charge", "Electronic Money Transfer Levy"]):
                category = "Bank Charges & Levies"
                counterparty = "OPay"
            elif "Third-Party Merchant Order" in desc:
                parts = [p.strip() for p in desc.split('|')]
                if len(parts) >= 2: counterparty = parts[1]
                category = "Merchants & Services"

            # Keep the full date string — don't truncate with split()[0]
            raw_date = str(row.get('Trans. Date', ''))
            rows.append({
                "Date": raw_date,
                "Description": desc,
                "Category": category,
                "Counterparty": counterparty,
                "Bank": bank,
                "Account": account,
                "Narration": narration,
                "Debit": debit,
                "Credit": credit,
                "Balance": row.get('Balance After(₦)', 0.0)
            })

        self.transactions_parsed = pd.DataFrame(rows)


# ============================================================
# PART 3: FINANCIAL INTELLIGENCE ENGINE (Deep Analytics)
# ============================================================
