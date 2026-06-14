import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict
from api.core.nlp import clean_counterparty, fuzzy_deduplicate

class FinancialIntelligenceEngine:
    """Generates deep, actionable financial intelligence from parsed transactions."""

    def __init__(self, analyzer=None, df=None, metadata=None, computed_totals=None, reported_totals=None, is_balanced=True, discrepancies=None):
        if analyzer:
            self.df = analyzer.transactions_parsed.copy()
            self.metadata = analyzer.metadata
            self.computed_totals = analyzer.computed_totals
            self.reported_totals = analyzer.reported_totals
            self.is_balanced = analyzer.is_balanced
            self.discrepancies = analyzer.discrepancies
        else:
            self.df = df.copy() if df is not None else pd.DataFrame()
            self.metadata = metadata or {}
            self.computed_totals = computed_totals or {"Total Inflow": 0, "Total Outflow": 0}
            self.reported_totals = reported_totals or {"Total Inflow": 0, "Total Outflow": 0}
            self.is_balanced = is_balanced
            self.discrepancies = discrepancies or []

        # Parse dates with explicit format matching OPay's "04 Aug 2023 12:43:58" format
        self.df['Date'] = pd.to_datetime(self.df['Date'], format='%d %b %Y %H:%M:%S', errors='coerce')
        # Fallback: try general parsing for any remaining NaTs
        mask = self.df['Date'].isna()
        if mask.any():
            self.df.loc[mask, 'Date'] = pd.to_datetime(self.df.loc[mask, 'Date'].astype(str), errors='coerce')
        self.df = self.df.dropna(subset=['Date'])
        self.df['Month'] = self.df['Date'].dt.to_period('M').astype(str)
        self.df['DayOfWeek'] = self.df['Date'].dt.day_name()
        self.df['DayOfMonth'] = self.df['Date'].dt.day
        self.df['WeekOfYear'] = self.df['Date'].dt.isocalendar().week.astype(int)

        # Apply NLP text normalization & fuzzy deduplication
        self.df['Counterparty'] = self.df['Counterparty'].apply(clean_counterparty)
        unique_names = self.df[self.df['Counterparty'] != '']['Counterparty'].unique()
        dedup_map = fuzzy_deduplicate(unique_names.tolist(), threshold=0.85)
        self.df['Counterparty'] = self.df['Counterparty'].replace(dedup_map)

        # Hybrid Mask Resolution
        if 'Account' not in self.df.columns:
            self.df['Account'] = ""
        
        # Build registry of full accounts
        registry = {}
        for _, row in self.df[(self.df['Counterparty'] != '') & (self.df['Account'] != '')].iterrows():
            acc = str(row['Account']).strip()
            if '*' not in acc and len(acc) >= 4:
                # Key: (Counterparty_Name, first_3_digits, last_3_digits), Value: Full Account
                registry[(row['Counterparty'], acc[:3], acc[-3:])] = acc
        
        # Resolve masked accounts
        resolved_accounts = []
        for _, row in self.df.iterrows():
            acc = str(row['Account']).strip()
            name = row['Counterparty']
            if '*' in acc and len(acc) >= 6:
                key = (name, acc[:3], acc[-3:])
                if key in registry:
                    acc = registry[key]
            resolved_accounts.append(acc)
            
        self.df['Account'] = resolved_accounts
        
        # Generate Entity_ID
        self.df['Entity_ID'] = self.df.apply(
            lambda x: f"{x['Counterparty']} ({x['Account']})" if str(x['Account']).strip() != '' else x['Counterparty'], 
            axis=1
        )
        self.df['Counterparty'] = self.df['Counterparty'].replace(dedup_map)

        # DATA QUALITY ASSERTIONS
        # 1. Null or negative amounts
        assert self.df['Debit'].notna().all(), "Pipeline Integrity Error: Null values found in Debit column"
        assert self.df['Credit'].notna().all(), "Pipeline Integrity Error: Null values found in Credit column"
        assert (self.df['Debit'] >= 0).all(), "Pipeline Integrity Error: Negative values found in absolute Debit column"
        assert (self.df['Credit'] >= 0).all(), "Pipeline Integrity Error: Negative values found in absolute Credit column"
        
        # 2. Categorization check
        unknown_cats = self.df[self.df['Category'].isin(['Other', 'Unknown', ''])]
        if len(unknown_cats) > 20:
            print(f"QUALITY WARNING: High volume of uncategorized transactions ({len(unknown_cats)}).")
            
        # 3. Fragmentation check (using Entity_ID) -> Evil Twin Resolution
        merchant_names = self.df[self.df['Entity_ID'] != '']['Entity_ID'].unique().tolist()
        frag_map = fuzzy_deduplicate(merchant_names, threshold=0.80)
        
        # Apply mapping: If an entity is in the map, use the canonical name, otherwise use itself
        self.df['Parent_Entity'] = self.df['Entity_ID'].apply(lambda x: frag_map.get(x, x))
        
        if frag_map:
            print(f"QUALITY WARNING: Resolved {len(frag_map)} fragmented entity groups (Evil Twins).")

        self.total_inflow = self.computed_totals['Total Inflow']
        self.total_outflow = self.computed_totals['Total Outflow']

    def run_all(self):
        """Run every analytical module and return the complete intelligence report."""
        # Compute all modules
        overview = self._compute_overview()
        monthly = self._compute_monthly_trends()
        spending_bk = self._compute_spending_breakdown()
        merchants = self._compute_merchant_ranking()
        timeline = self._compute_spending_timeline()
        velocity = self._compute_spending_velocity()
        income = self._compute_income_analysis()
        savings = self._compute_savings_analysis()
        balance = self._compute_balance_trend()
        anomalies = self._detect_anomalies()
        recurring = self._detect_recurring_payments()
        health = self._compute_financial_health_score()

        # Generate insights AFTER all modules are computed (they reference results)
        insights = self._generate_all_insights(
            monthly, spending_bk, merchants, velocity,
            income, savings, anomalies, recurring, health
        )

        # Compute Quality Metrics Payload
        total_tx = len(self.df)
        unknown_count = len(self.df[self.df['Category'].isin(['Other', 'Unknown', ''])])
        unique_raw = self.df['Counterparty'].nunique()
        unique_cleaned = self.df['Entity_ID'].nunique()
        
        dedup_ratio = round((unique_raw / unique_cleaned) if unique_cleaned > 0 else 0, 2)
        null_percentage = round((self.df.isna().sum().sum() / self.df.size) * 100, 2)
        
        quality_metrics = {
            "total_transactions": total_tx,
            "uncategorized_count": unknown_count,
            "unique_merchants_raw": unique_raw,
            "unique_merchants_cleaned": unique_cleaned,
            "deduplication_ratio": dedup_ratio,
            "null_percentage": null_percentage,
            "negative_balance_count": len(self.df[self.df['Balance'] < 0])
        }

        # Serialize transactions for frontend
        tx_df = self.df.copy()
        tx_df['Date'] = tx_df['Date'].dt.strftime('%Y-%m-%d')
        tx_df = tx_df.drop(columns=['Month', 'DayOfWeek', 'DayOfMonth', 'WeekOfYear'], errors='ignore')

        return {
            "overview": overview,
            "monthly_trends": monthly,
            "spending_breakdown": spending_bk,
            "merchant_ranking": merchants,
            "spending_timeline": timeline,
            "spending_velocity": velocity,
            "income_analysis": income,
            "savings_analysis": savings,
            "balance_trend": balance,
            "anomalies": anomalies,
            "recurring_payments": recurring,
            "financial_health": health,
            "insights": insights,
            "quality_report": quality_metrics,
            "transactions": tx_df.to_dict(orient='records'),
            "profile": self.metadata
        }

    # ----------------------------------------------------------
    # MODULE 1: Overview
    # ----------------------------------------------------------
    def _compute_overview(self):
        df = self.df
        outflow_no_savings = df[(df['Debit'] > 0) & (~df['Category'].isin(['Savings & Investments', 'Internal Transfer']))]['Debit'].sum()
        savings_total = df[df['Category'] == 'Savings & Investments']['Debit'].sum()
        savings_withdrawal_total = df[df['Category'] == 'Savings Withdrawal']['Credit'].sum()
        net_savings = savings_total - savings_withdrawal_total
        
        real_inflow = df[(df['Credit'] > 0) & (~df['Category'].isin(['Internal Transfer', 'Savings Withdrawal']))]['Credit'].sum()
        savings_rate = (net_savings / real_inflow * 100) if real_inflow > 0 else 0

        return {
            "total_inflow": self.total_inflow,
            "total_outflow": self.total_outflow,
            "real_inflow": round(real_inflow, 2),
            "real_outflow": round(outflow_no_savings, 2),
            "internal_sweeps_in": round(self.total_inflow - real_inflow, 2),
            "internal_sweeps_out": round(self.total_outflow - outflow_no_savings, 2),
            "net_flow": round(self.total_inflow - self.total_outflow, 2),
            "total_spending": round(outflow_no_savings, 2),
            "total_savings": round(savings_total, 2),
            "total_withdrawn_from_savings": round(savings_withdrawal_total, 2),
            "net_savings": round(net_savings, 2),
            "savings_rate": round(savings_rate, 1),
            "total_transactions": len(df),
            "inflow_transactions": int((df['Credit'] > 0).sum()),
            "outflow_transactions": int((df['Debit'] > 0).sum()),
            "unique_counterparties": int(df[df['Counterparty'] != '']['Counterparty'].nunique()),
            "date_range": {
                "start": df['Date'].min().strftime('%Y-%m-%d'),
                "end": df['Date'].max().strftime('%Y-%m-%d')
            },
            "reconciliation": {
                "is_balanced": self.is_balanced,
                "reported_inflow": self.reported_totals['Total Inflow'],
                "computed_inflow": self.computed_totals['Total Inflow'],
                "reported_outflow": self.reported_totals['Total Outflow'],
                "computed_outflow": self.computed_totals['Total Outflow'],
                "discrepancies": self.discrepancies
            }
        }

    # ----------------------------------------------------------
    # MODULE 2: Monthly Trends
    # ----------------------------------------------------------
    def _compute_monthly_trends(self):
        df = self.df
        months = sorted(df['Month'].unique())
        trends = []
        for m in months:
            mdf = df[df['Month'] == m]
            inflow = round(mdf[(mdf['Credit'] > 0) & (mdf['Category'] != 'Internal Transfer')]['Credit'].sum(), 2)
            outflow = round(mdf[(mdf['Debit'] > 0) & (mdf['Category'] != 'Internal Transfer')]['Debit'].sum(), 2)
            savings = round(mdf[mdf['Category'] == 'Savings & Investments']['Debit'].sum(), 2)
            spending = round(outflow - savings, 2)
            balance_entries = mdf[mdf['Balance'] > 0]
            balance_end = round(balance_entries['Balance'].iloc[-1], 2) if not balance_entries.empty else 0
            trends.append({
                "month": m, "inflow": inflow, "outflow": outflow,
                "net": round(inflow - outflow, 2), "savings": savings,
                "spending": spending, "balance_end": balance_end,
                "transaction_count": len(mdf)
            })

        # Compute month-over-month changes
        for i in range(1, len(trends)):
            prev_spending = trends[i-1]['spending']
            curr_spending = trends[i]['spending']
            if prev_spending > 0:
                trends[i]['spending_change_pct'] = round(((curr_spending - prev_spending) / prev_spending) * 100, 1)
            else:
                trends[i]['spending_change_pct'] = 0
        if trends:
            trends[0]['spending_change_pct'] = 0

        return trends

    # ----------------------------------------------------------
    # MODULE 3: Spending Breakdown
    # ----------------------------------------------------------
    def _compute_spending_breakdown(self):
        df = self.df[(self.df['Debit'] > 0) & (self.df['Category'] != 'Internal Transfer')]
        total = df['Debit'].sum()

        # By category
        cat_groups = df.groupby('Category').agg(
            total=('Debit', 'sum'),
            count=('Debit', 'count'),
            avg=('Debit', 'mean'),
            max_single=('Debit', 'max')
        ).reset_index()
        categories = []
        for _, r in cat_groups.iterrows():
            categories.append({
                "name": r['Category'],
                "total": round(r['total'], 2),
                "percentage": round((r['total'] / total * 100) if total > 0 else 0, 1),
                "count": int(r['count']),
                "avg": round(r['avg'], 2),
                "max_single": round(r['max_single'], 2)
            })
        categories.sort(key=lambda x: x['total'], reverse=True)

        # Monthly by category
        monthly_cat = []
        for m in sorted(df['Month'].unique()):
            mdf = df[df['Month'] == m]
            entry = {"month": m}
            for cat in cat_groups['Category']:
                entry[cat] = round(mdf[mdf['Category'] == cat]['Debit'].sum(), 2)
            monthly_cat.append(entry)

        return {"categories": categories, "monthly_breakdown": monthly_cat}

    # ----------------------------------------------------------
    # MODULE 4: Merchant / Counterparty Ranking
    # ----------------------------------------------------------
    def _compute_merchant_ranking(self):
        df = self.df[(self.df['Debit'] > 0) & (self.df['Parent_Entity'] != '') & (~self.df['Category'].isin(['Internal Transfer', 'Savings & Investments', 'Savings Withdrawal']))]
        if df.empty:
            return []
        total_outflow = df['Debit'].sum()
        groups = df.groupby('Parent_Entity').agg(
            total=('Debit', 'sum'),
            count=('Debit', 'count'),
            avg=('Debit', 'mean'),
            last_date=('Date', 'max')
        ).reset_index()
        
        merchants = []
        for _, r in groups.iterrows():
            parent = r['Parent_Entity']
            # Get sub-entities
            sub_df = df[df['Parent_Entity'] == parent].groupby(['Counterparty', 'Account']).agg(
                sub_total=('Debit', 'sum'),
                sub_count=('Debit', 'count')
            ).reset_index()
            sub_entities = []
            for _, sr in sub_df.iterrows():
                sub_entities.append({
                    "name": sr['Counterparty'],
                    "account": sr['Account'],
                    "total": round(sr['sub_total'], 2),
                    "count": int(sr['sub_count'])
                })
            txns_df = df[df['Parent_Entity'] == parent].sort_values('Date', ascending=False).head(15)
            recent_txns = []
            for _, tr in txns_df.iterrows():
                recent_txns.append({
                    "date": tr['Date'].strftime('%d %b %Y') if pd.notna(tr['Date']) else str(tr['Date']),
                    "amount": round(tr['Debit'], 2),
                    "desc": tr['Description']
                })
                
            merchants.append({
                "name": parent,
                "total": round(r['total'], 2),
                "count": int(r['count']),
                "avg": round(r['avg'], 2),
                "percentage": round((r['total'] / total_outflow * 100) if total_outflow > 0 else 0, 1),
                "last_transaction": r['last_date'].strftime('%Y-%m-%d'),
                "sub_entities": sorted(sub_entities, key=lambda x: x['total'], reverse=True),
                "recent_txns": recent_txns
            })
        merchants.sort(key=lambda x: x['total'], reverse=True)
        return merchants

    # ----------------------------------------------------------
    # MODULE 5: Spending Timeline
    # ----------------------------------------------------------
    def _compute_spending_timeline(self):
        df = self.df[self.df['Debit'] > 0]
        # Daily
        daily = df.groupby(df['Date'].dt.strftime('%Y-%m-%d'))['Debit'].sum().reset_index()
        daily.columns = ['date', 'amount']
        daily['amount'] = daily['amount'].round(2)
        # Monthly
        monthly = df.groupby('Month')['Debit'].sum().reset_index()
        monthly.columns = ['month', 'amount']
        monthly['amount'] = monthly['amount'].round(2)
        monthly = monthly.sort_values('month')

        return {
            "daily": daily.to_dict(orient='records'),
            "monthly": monthly.to_dict(orient='records')
        }

    # ----------------------------------------------------------
    # MODULE 6: Spending Velocity (Day-of-Week & Day-of-Month)
    # ----------------------------------------------------------
    def _compute_spending_velocity(self):
        df = self.df[self.df['Debit'] > 0]
        day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

        # By day of week
        dow = df.groupby('DayOfWeek').agg(total=('Debit', 'sum'), count=('Debit', 'count'), avg=('Debit', 'mean')).reset_index()
        dow_list = []
        for day in day_order:
            row = dow[dow['DayOfWeek'] == day]
            if not row.empty:
                r = row.iloc[0]
                dow_list.append({"day": day, "total": round(r['total'], 2), "count": int(r['count']), "avg": round(r['avg'], 2)})
            else:
                dow_list.append({"day": day, "total": 0, "count": 0, "avg": 0})

        # By day of month
        dom = df.groupby('DayOfMonth').agg(total=('Debit', 'sum'), count=('Debit', 'count')).reset_index()
        dom_list = []
        for d in range(1, 32):
            row = dom[dom['DayOfMonth'] == d]
            if not row.empty:
                r = row.iloc[0]
                dom_list.append({"day": d, "total": round(r['total'], 2), "count": int(r['count'])})
            else:
                dom_list.append({"day": d, "total": 0, "count": 0})

        # Peak day
        peak_dow = max(dow_list, key=lambda x: x['total'])['day'] if dow_list else "N/A"
        peak_dom = max(dom_list, key=lambda x: x['total'])['day'] if dom_list else 0

        return {
            "by_day_of_week": dow_list,
            "by_day_of_month": dom_list,
            "peak_day_of_week": peak_dow,
            "peak_day_of_month": peak_dom
        }

    # ----------------------------------------------------------
    # MODULE 7: Income Analysis
    # ----------------------------------------------------------
    def _compute_income_analysis(self):
        df = self.df[(self.df['Credit'] > 0) & (~self.df['Category'].isin(['Internal Transfer', 'Savings Withdrawal', 'Savings & Investments']))]
        total_income = df['Credit'].sum()

        # Income sources
        sources_df = df[df['Parent_Entity'] != ''].groupby('Parent_Entity').agg(
            total=('Credit', 'sum'), count=('Credit', 'count')
        ).reset_index()
        sources = []
        for _, r in sources_df.iterrows():
            parent = r['Parent_Entity']
            sub_df = df[df['Parent_Entity'] == parent].groupby(['Counterparty', 'Account']).agg(
                sub_total=('Credit', 'sum'), sub_count=('Credit', 'count')
            ).reset_index()
            sub_entities = []
            for _, sr in sub_df.iterrows():
                sub_entities.append({
                    "name": sr['Counterparty'], "account": sr['Account'],
                    "total": round(sr['sub_total'], 2), "count": int(sr['sub_count'])
                })
            sources.append({
                "name": parent,
                "total": round(r['total'], 2),
                "count": int(r['count']),
                "percentage": round((r['total'] / total_income * 100) if total_income > 0 else 0, 1),
                "sub_entities": sorted(sub_entities, key=lambda x: x['total'], reverse=True)
            })
        sources.sort(key=lambda x: x['total'], reverse=True)

        # Monthly income
        monthly = df.groupby('Month')['Credit'].sum().reset_index()
        monthly.columns = ['month', 'total']
        monthly['total'] = monthly['total'].round(2)
        monthly = monthly.sort_values('month')
        monthly_list = monthly.to_dict(orient='records')

        # Income stability score (0-100)
        # Based on: coefficient of variation (lower = more stable), number of sources, regularity
        stability = 50  # baseline
        if len(monthly_list) >= 2:
            amounts = [m['total'] for m in monthly_list]
            mean_inc = np.mean(amounts)
            std_inc = np.std(amounts)
            cv = (std_inc / mean_inc) if mean_inc > 0 else 1
            # Lower CV = more stable. CV of 0 = perfect stability
            cv_score = max(0, min(100, int(100 - cv * 100)))
            stability = cv_score

        # Source diversity bonus
        if len(sources) >= 3:
            stability = min(100, stability + 10)
        elif len(sources) == 1:
            stability = max(0, stability - 15)

        # Income vs Spending overlay
        all_months = sorted(self.df['Month'].unique())
        overlay = []
        for m in all_months:
            mdf = self.df[self.df['Month'] == m]
            overlay.append({
                "month": m,
                "income": round(mdf['Credit'].sum(), 2),
                "spending": round(mdf['Debit'].sum(), 2)
            })

        return {
            "total_income": round(total_income, 2),
            "sources": sources,
            "monthly": monthly_list,
            "stability_score": stability,
            "avg_monthly_income": round(total_income / max(len(monthly_list), 1), 2),
            "source_count": len(sources),
            "income_vs_spending": overlay
        }

    # ----------------------------------------------------------
    # MODULE 8: Savings Analysis
    # ----------------------------------------------------------
    def _compute_savings_analysis(self):
        df = self.df
        savings_df = df[df['Category'] == 'Savings & Investments']
        withdrawals_df = df[df['Category'] == 'Savings Withdrawal']
        
        total_saved = savings_df['Debit'].sum()
        total_withdrawn = withdrawals_df['Credit'].sum()
        net_saved = total_saved - total_withdrawn
        
        real_inflow = df[(df['Credit'] > 0) & (~df['Category'].isin(['Internal Transfer', 'Savings Withdrawal']))]['Credit'].sum()
        savings_rate = (net_saved / real_inflow * 100) if real_inflow > 0 else 0
        if savings_rate < 0:
            savings_rate = 0

        # Breakdown by type (OWealth, Spend & Save, etc.)
        breakdown = []
        cps = set(savings_df['Counterparty'].dropna().unique()).union(set(withdrawals_df['Counterparty'].dropna().unique()))
        for cp in cps:
            if cp:
                amt = savings_df[savings_df['Counterparty'] == cp]['Debit'].sum()
                w_amt = withdrawals_df[withdrawals_df['Counterparty'] == cp]['Credit'].sum()
                net_amt = amt - w_amt
                
                breakdown.append({
                    "type": cp,
                    "amount": round(net_amt, 2),
                    "amount_saved": round(amt, 2),
                    "amount_withdrawn": round(w_amt, 2),
                    "percentage": round((amt / total_saved * 100) if total_saved > 0 else 0, 1)
                })
        breakdown.sort(key=lambda x: x['amount'], reverse=True)

        # Monthly savings
        monthly_list = []
        all_months = sorted(df['Month'].unique())
        for m in all_months:
            month_inflow = df[(df['Month'] == m) & (df['Credit'] > 0) & (~df['Category'].isin(['Internal Transfer', 'Savings Withdrawal']))]['Credit'].sum()
            month_savings = savings_df[savings_df['Month'] == m]['Debit'].sum() if 'Month' in savings_df.columns else 0
            month_withdrawn = withdrawals_df[withdrawals_df['Month'] == m]['Credit'].sum() if 'Month' in withdrawals_df.columns else 0
            month_net = month_savings - month_withdrawn
            monthly_list.append({
                "month": m,
                "amount": round(month_net, 2),
                "amount_saved": round(month_savings, 2),
                "amount_withdrawn": round(month_withdrawn, 2),
                "rate": round((month_net / month_inflow * 100) if month_inflow > 0 else 0, 1)
            })

        # Projections (based on net_saved)
        num_months = max(len(all_months), 1)
        avg_monthly_savings = net_saved / num_months
        projections = {}
        for target_label, target in [("500k", 500000), ("1m", 1000000), ("5m", 5000000)]:
            if avg_monthly_savings > 0:
                remaining = max(0, target - net_saved)
                months_needed = int(np.ceil(remaining / avg_monthly_savings))
                projections[target_label] = months_needed
            else:
                projections[target_label] = -1  # unreachable

        return {
            "total_saved": round(total_saved, 2),
            "total_withdrawn": round(total_withdrawn, 2),
            "net_saved": round(net_saved, 2),
            "savings_rate": round(savings_rate, 1),
            "breakdown": breakdown,
            "monthly": monthly_list,
            "avg_monthly_savings": round(avg_monthly_savings, 2),
            "projections": projections
        }

    # ----------------------------------------------------------
    # MODULE 9: Balance Trend
    # ----------------------------------------------------------
    def _compute_balance_trend(self):
        df = self.df[self.df['Balance'] > 0].sort_values('Date')
        if df.empty:
            return {"timeline": [], "highest": None, "lowest": None, "current": 0}

        timeline = []
        for _, r in df.iterrows():
            timeline.append({"date": r['Date'].strftime('%Y-%m-%d'), "balance": round(r['Balance'], 2)})

        highest_idx = df['Balance'].idxmax()
        lowest_idx = df['Balance'].idxmin()

        return {
            "timeline": timeline,
            "highest": {
                "balance": round(df.loc[highest_idx, 'Balance'], 2),
                "date": df.loc[highest_idx, 'Date'].strftime('%Y-%m-%d')
            },
            "lowest": {
                "balance": round(df.loc[lowest_idx, 'Balance'], 2),
                "date": df.loc[lowest_idx, 'Date'].strftime('%Y-%m-%d')
            },
            "current": round(df['Balance'].iloc[-1], 2)
        }

    # ----------------------------------------------------------
    # MODULE 10: Anomaly Detection
    # ----------------------------------------------------------
    def _detect_anomalies(self):
        df = self.df[self.df['Debit'] > 0]
        anomalies = []

        for cat in df['Category'].unique():
            cat_df = df[df['Category'] == cat]
            if len(cat_df) < 3:
                continue
            mean = cat_df['Debit'].mean()
            std = cat_df['Debit'].std()
            if std == 0:
                continue
            threshold = mean + 2 * std

            for _, r in cat_df[cat_df['Debit'] > threshold].iterrows():
                multiplier = round(r['Debit'] / mean, 1)
                anomalies.append({
                    "date": r['Date'].strftime('%Y-%m-%d'),
                    "description": r['Description'][:80],
                    "amount": round(r['Debit'], 2),
                    "category": cat,
                    "counterparty": r['Counterparty'],
                    "severity": "high" if multiplier >= 5 else "medium",
                    "explanation": f"This is {multiplier}x your typical {cat.lower()} transaction (avg ₦{mean:,.0f})",
                    "category_avg": round(mean, 2),
                    "multiplier": multiplier
                })

        anomalies.sort(key=lambda x: x['amount'], reverse=True)
        return anomalies

    # ----------------------------------------------------------
    # MODULE 11: Recurring Payment Detection
    # ----------------------------------------------------------
    def _detect_recurring_payments(self):
        df = self.df[(self.df['Debit'] > 0) & (self.df['Counterparty'] != '')]
        recurring = []

        for cp in df['Counterparty'].unique():
            cp_df = df[df['Counterparty'] == cp].sort_values('Date')
            if len(cp_df) < 3:
                continue

            amounts = cp_df['Debit'].values
            mean_amt = np.mean(amounts)
            # Check if amounts are similar (within 15% of mean)
            if mean_amt == 0:
                continue
            amount_variation = np.std(amounts) / mean_amt
            if amount_variation > 0.15:
                continue  # Amounts vary too much

            # Check interval regularity
            dates = cp_df['Date'].sort_values().values
            intervals = []
            for i in range(1, len(dates)):
                delta = (pd.Timestamp(dates[i]) - pd.Timestamp(dates[i-1])).days
                if delta > 0:
                    intervals.append(delta)

            if not intervals:
                continue

            avg_interval = np.mean(intervals)
            interval_std = np.std(intervals)

            # Determine frequency
            if 1 <= avg_interval <= 10:
                frequency = "Weekly"
            elif 11 <= avg_interval <= 20:
                frequency = "Bi-weekly"
            elif 21 <= avg_interval <= 45:
                frequency = "Monthly"
            elif 46 <= avg_interval <= 100:
                frequency = "Quarterly"
            else:
                frequency = f"Every ~{int(avg_interval)} days"

            # Only flag if intervals are somewhat regular (std < 50% of mean)
            if interval_std > avg_interval * 0.5 and len(intervals) > 2:
                continue

            recurring.append({
                "counterparty": cp,
                "estimated_amount": round(mean_amt, 2),
                "frequency": frequency,
                "count": int(len(cp_df)),
                "total_spent": round(cp_df['Debit'].sum(), 2),
                "last_payment": cp_df['Date'].max().strftime('%Y-%m-%d'),
                "monthly_cost": round(mean_amt * (30 / max(avg_interval, 1)), 2)
            })

        recurring.sort(key=lambda x: x['total_spent'], reverse=True)
        return recurring

    # ----------------------------------------------------------
    # MODULE 12: Financial Health Score v2 (Multi-Factor)
    # ----------------------------------------------------------
    def _compute_financial_health_score(self):
        factors = {}

        # 1. Savings Rate (weight: 25)
        savings_total = self.df[self.df['Category'] == 'Savings & Investments']['Debit'].sum()
        sr = (savings_total / self.total_inflow * 100) if self.total_inflow > 0 else 0
        if sr >= 30: sr_score = 100
        elif sr >= 20: sr_score = 85
        elif sr >= 10: sr_score = 70
        elif sr >= 5: sr_score = 50
        else: sr_score = 20
        factors['savings_rate'] = {
            "score": sr_score, "weight": 25,
            "detail": f"You save {sr:.1f}% of your income" + (" — excellent!" if sr >= 20 else " — there's room to improve")
        }

        # 2. Income Stability (weight: 20)
        monthly_income = self.df[self.df['Credit'] > 0].groupby('Month')['Credit'].sum()
        if len(monthly_income) >= 2:
            cv = monthly_income.std() / monthly_income.mean() if monthly_income.mean() > 0 else 1
            is_score = max(0, min(100, int(100 - cv * 80)))
        else:
            is_score = 50
        factors['income_stability'] = {
            "score": is_score, "weight": 20,
            "detail": "Very consistent income" if is_score >= 70 else "Income fluctuates significantly" if is_score < 40 else "Moderately stable income"
        }

        # 3. Spending Consistency (weight: 15) — low variance in monthly spending = good
        monthly_spending = self.df[self.df['Debit'] > 0].groupby('Month')['Debit'].sum()
        if len(monthly_spending) >= 2:
            cv_spend = monthly_spending.std() / monthly_spending.mean() if monthly_spending.mean() > 0 else 1
            sc_score = max(0, min(100, int(100 - cv_spend * 80)))
        else:
            sc_score = 50
        factors['spending_consistency'] = {
            "score": sc_score, "weight": 15,
            "detail": "Predictable spending pattern" if sc_score >= 70 else "Erratic spending — consider budgeting"
        }

        # 4. Bank Charges Ratio (weight: 10) — lower is better
        charges = self.df[self.df['Category'] == 'Bank Charges & Levies']['Debit'].sum()
        charge_pct = (charges / self.total_outflow * 100) if self.total_outflow > 0 else 0
        if charge_pct < 0.5: cr_score = 100
        elif charge_pct < 1: cr_score = 80
        elif charge_pct < 2: cr_score = 60
        elif charge_pct < 5: cr_score = 40
        else: cr_score = 20
        factors['charge_ratio'] = {
            "score": cr_score, "weight": 10,
            "detail": f"Bank charges are {charge_pct:.1f}% of outflow" + (" — minimal!" if charge_pct < 1 else " — consider reducing USSD usage")
        }

        # 5. Balance Trend (weight: 15) — is balance growing or shrinking?
        balance_df = self.df[self.df['Balance'] > 0].sort_values('Date')
        if len(balance_df) >= 2:
            first_q = balance_df['Balance'].iloc[:len(balance_df)//4].mean()
            last_q = balance_df['Balance'].iloc[-len(balance_df)//4:].mean()
            if first_q > 0:
                growth = ((last_q - first_q) / first_q) * 100
                if growth > 20: bt_score = 100
                elif growth > 5: bt_score = 80
                elif growth > -5: bt_score = 60
                elif growth > -20: bt_score = 40
                else: bt_score = 20
            else:
                bt_score = 50
        else:
            bt_score = 50
        factors['balance_trend'] = {
            "score": bt_score, "weight": 15,
            "detail": "Balance trending upward" if bt_score >= 70 else "Balance declining — monitor spending" if bt_score < 40 else "Balance is relatively stable"
        }

        # 6. Anomaly Frequency (weight: 5) — fewer anomalies = more predictable
        anomalies = self._detect_anomalies()
        total_tx = len(self.df)
        anomaly_pct = (len(anomalies) / total_tx * 100) if total_tx > 0 else 0
        if anomaly_pct < 1: af_score = 100
        elif anomaly_pct < 3: af_score = 70
        elif anomaly_pct < 5: af_score = 50
        else: af_score = 30
        factors['anomaly_frequency'] = {
            "score": af_score, "weight": 5,
            "detail": f"{len(anomalies)} unusual transactions detected" + (" — spending is predictable" if af_score >= 70 else "")
        }

        # 7. Diversification (weight: 10) — not over-reliant on one category
        cat_totals = self.df[self.df['Debit'] > 0].groupby('Category')['Debit'].sum()
        if len(cat_totals) > 0 and self.total_outflow > 0:
            max_pct = cat_totals.max() / self.total_outflow * 100
            if max_pct < 40: div_score = 100
            elif max_pct < 60: div_score = 70
            elif max_pct < 80: div_score = 50
            else: div_score = 30
        else:
            div_score = 50
        factors['diversification'] = {
            "score": div_score, "weight": 10,
            "detail": "Well-diversified spending" if div_score >= 70 else "Spending is concentrated in one category"
        }

        # Compute weighted average
        total_weight = sum(f['weight'] for f in factors.values())
        overall = sum(f['score'] * f['weight'] for f in factors.values()) / total_weight if total_weight > 0 else 0
        overall = int(round(overall))

        # Grade
        if overall >= 90: grade = "A+"
        elif overall >= 80: grade = "A"
        elif overall >= 70: grade = "B+"
        elif overall >= 60: grade = "B"
        elif overall >= 50: grade = "C"
        elif overall >= 40: grade = "D"
        else: grade = "F"

        return {"overall": overall, "grade": grade, "factors": factors}

    # ----------------------------------------------------------
    # MODULE 13: Insight Generator (Prioritized & Categorized)
    # ----------------------------------------------------------
    def _generate_all_insights(self, monthly, spending_bk, merchants, velocity, income, savings, anomalies, recurring, health):
        insights = []
        idx = 0

        def add(priority, category, title, desc, amount=None, rec=""):
            nonlocal idx
            idx += 1
            insights.append({"id": idx, "priority": priority, "category": category, "title": title, "description": desc, "amount": amount, "recommendation": rec})

        # --- SPENDING INSIGHTS ---
        cats = spending_bk.get('categories', [])
        if cats:
            top = cats[0]
            add("info", "spending", f"Biggest Expense Category: {top['name']}",
                f"You spent ₦{top['total']:,.0f} across {top['count']} transactions in this category, which is {top['percentage']}% of your total outflow.",
                top['total'],
                f"Track your {top['name'].lower()} expenses closely and set a monthly budget cap.")

        # Utilities insight
        utils = next((c for c in cats if c['name'] == 'Utilities (Airtime/Data)'), None)
        if utils and utils['total'] > 10000:
            add("warning", "spending", "High Airtime/Data Spending",
                f"You've spent ₦{utils['total']:,.0f} on airtime and data across {utils['count']} purchases (avg ₦{utils['avg']:,.0f} each).",
                utils['total'],
                "Consider switching to a monthly bulk data plan instead of frequent small purchases. This alone could save you 20-30%.")

        # Bank charges
        charges = next((c for c in cats if c['name'] == 'Bank Charges & Levies'), None)
        if charges:
            add("info", "spending", f"₦{charges['total']:,.0f} Lost to Bank Charges",
                f"You paid ₦{charges['total']:,.0f} in fees and levies over this period. That's ₦{charges['avg']:,.0f} per charge across {charges['count']} deductions.",
                charges['total'],
                "Reduce USSD transactions and use the OPay app directly to minimize charges.")

        # --- MERCHANT INSIGHTS ---
        if merchants and len(merchants) >= 1:
            top_m = merchants[0]
            add("info", "spending", f"Top Recipient: {top_m['name']}",
                f"You sent ₦{top_m['total']:,.0f} to {top_m['name']} across {top_m['count']} transactions ({top_m['percentage']}% of your outflows).",
                top_m['total'])

        # --- MONTHLY TREND INSIGHTS ---
        if len(monthly) >= 2:
            # Find the month with highest spending
            peak_month = max(monthly, key=lambda m: m['spending'])
            add("info", "spending", f"Peak Spending Month: {peak_month['month']}",
                f"You spent ₦{peak_month['spending']:,.0f} (excluding savings) in {peak_month['month']}. This was your highest spending period.",
                peak_month['spending'])

            # Month-over-month spike detection
            for i in range(1, len(monthly)):
                change = monthly[i].get('spending_change_pct', 0)
                if change > 30:
                    add("warning", "spending", f"Spending Spike in {monthly[i]['month']}",
                        f"Your spending jumped {change}% from {monthly[i-1]['month']} to {monthly[i]['month']} (₦{monthly[i-1]['spending']:,.0f} → ₦{monthly[i]['spending']:,.0f}).",
                        monthly[i]['spending'],
                        "Investigate what caused this spike and whether it was a one-time event or a new pattern.")

        # --- VELOCITY INSIGHTS ---
        peak_dow = velocity.get('peak_day_of_week', 'N/A')
        if peak_dow != 'N/A':
            dow_data = next((d for d in velocity['by_day_of_week'] if d['day'] == peak_dow), None)
            if dow_data:
                add("info", "habit", f"You Spend Most on {peak_dow}s",
                    f"₦{dow_data['total']:,.0f} total spent on {peak_dow}s across {dow_data['count']} transactions (avg ₦{dow_data['avg']:,.0f}).",
                    dow_data['total'],
                    f"Be extra mindful of purchases on {peak_dow}s. Consider leaving your card at home or setting a daily limit.")

        # --- INCOME INSIGHTS ---
        if income['source_count'] == 1 and income['sources']:
            add("warning", "income", "Single Income Source",
                f"100% of your income comes from {income['sources'][0]['name']}. If this source stops, you have no backup.",
                income['total_income'],
                "Diversify your income streams. Consider side projects, investments, or freelance work.")
        elif income['source_count'] >= 3:
            add("positive", "income", "Diversified Income — Great!",
                f"You receive money from {income['source_count']} different sources. This provides financial resilience.",
                income['total_income'])

        if income['stability_score'] < 40:
            add("warning", "income", "Unstable Income Pattern",
                f"Your income fluctuates significantly month to month (stability score: {income['stability_score']}/100).",
                rec="Build a 3-month emergency fund to buffer against low-income months.")

        # --- SAVINGS INSIGHTS ---
        sr = savings['savings_rate']
        if sr >= 30:
            add("positive", "savings", f"Incredible Saver — {sr}% Rate!",
                f"You save {sr}% of your income (₦{savings['total_saved']:,.0f} total). This puts you in the top tier of financial health.",
                savings['total_saved'])
        elif sr >= 15:
            add("positive", "savings", f"Good Savings Rate: {sr}%",
                f"You're saving {sr}% of your income. The recommended minimum is 20%.",
                savings['total_saved'],
                f"Try increasing your auto-save by ₦{int((0.2 * self.total_inflow - savings['total_saved']) / max(len(monthly), 1)):,}/month to hit 20%.")
        elif sr > 0:
            add("warning", "savings", f"Low Savings Rate: {sr}%",
                f"Only {sr}% of your income went to savings. At this rate, building wealth will be very slow.",
                savings['total_saved'],
                "Set up automatic OWealth deposits immediately after each income receipt. Even 10% makes a difference.")
        else:
            add("critical", "savings", "Zero Savings Detected",
                "You saved nothing during this period. This is a financial emergency.",
                rec="Start with even ₦500/day auto-save. Consistency matters more than amount.")

        # Savings projection insight
        proj = savings.get('projections', {})
        if proj.get('1m', -1) > 0:
            add("info", "savings", f"₦1M Savings Projection: {proj['1m']} Months",
                f"At your current average savings of ₦{savings['avg_monthly_savings']:,.0f}/month, you'll reach ₦1,000,000 in approximately {proj['1m']} months.",
                rec="Increase monthly savings by 20% to cut this timeline significantly.")

        # --- ANOMALY INSIGHTS ---
        if anomalies:
            for a in anomalies[:3]:  # Top 3 anomalies
                add(a['severity'] if a['severity'] == 'critical' else 'warning', "anomaly",
                    f"Unusual Transaction: ₦{a['amount']:,.0f}",
                    f"{a['explanation']}. Sent to {a['counterparty'] or 'unknown'} on {a['date']}.",
                    a['amount'],
                    "Review this transaction — was it planned or impulsive?")

        # --- RECURRING PAYMENT INSIGHTS ---
        if recurring:
            total_recurring = sum(r['monthly_cost'] for r in recurring)
            add("info", "habit", f"{len(recurring)} Recurring Payments Detected (₦{total_recurring:,.0f}/mo)",
                "Detected recurring payments: " + ", ".join([f"{r['counterparty']} (~₦{r['estimated_amount']:,.0f}/{r['frequency'].lower()})" for r in recurring[:5]]),
                total_recurring,
                "Review each recurring payment — cancel any you no longer need.")

        # --- FINANCIAL HEALTH INSIGHTS ---
        grade = health['grade']
        overall = health['overall']
        if overall >= 80:
            add("positive", "health", f"Financial Grade: {grade} ({overall}/100)",
                "Your overall financial health is excellent. Keep maintaining these habits!",
                rec="Focus on growing your investments and emergency fund.")
        elif overall >= 60:
            add("info", "health", f"Financial Grade: {grade} ({overall}/100)",
                "Your finances are decent but there's room for improvement.",
                rec="Focus on the lowest-scoring factors in your health breakdown.")
        else:
            add("critical", "health", f"Financial Grade: {grade} ({overall}/100)",
                "Your financial health needs urgent attention.",
                rec="Start with the basics: build an emergency fund, reduce unnecessary spending, and automate your savings.")

        # Sort by priority
        priority_order = {"critical": 0, "warning": 1, "info": 2, "positive": 3}
        insights.sort(key=lambda x: priority_order.get(x['priority'], 4))

        return insights


# ============================================================
# PART 4: FASTAPI APPLICATION
# ============================================================
