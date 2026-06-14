import React from 'react';
import { useAnalysis } from '../App.jsx';
import { PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];
const ttStyle = {
  contentStyle: { background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '12px' },
};

export default function Spending() {
  const { data } = useAnalysis();
  if (!data) return null;

  const { spending_breakdown, merchant_ranking, spending_velocity, spending_timeline, anomalies } = data;
  const cats = spending_breakdown.categories || [];
  const monthlyBreakdown = spending_breakdown.monthly_breakdown || [];
  const merchants = merchant_ranking || [];
  const velocity = spending_velocity || {};
  const anomalyList = anomalies || [];

  // Prepare stacked area chart data — each month, with category keys
  const allCats = cats.map(c => c.name);

  return (
    <div>
      <div className="page-header animate-in">
        <h2>Spending Analytics</h2>
        <p>Understand where every naira goes — by category, merchant, and time</p>
      </div>

      {/* Category Breakdown: Donut + Bar */}
      <div className="grid-2 animate-in delay-1">
        <div className="card">
          <div className="card-header"><div className="card-title">Category Breakdown</div></div>
          <div className="chart-container" style={{ height: '280px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={cats} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} stroke="none">
                  {cats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...ttStyle} formatter={(v) => [fmt(v)]} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Category Detail</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {cats.map((c, i) => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                    {c.name}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{fmt(c.total)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({c.percentage}%)</span></span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${c.percentage}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.count} txns • avg {fmt(c.avg)} • max {fmt(c.max_single)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Spending Trends */}
      <div className="card animate-in delay-2" style={{ marginTop: '20px' }}>
        <div className="card-header"><div className="card-title">Monthly Spending by Category</div></div>
        <div className="chart-container-lg">
          <ResponsiveContainer>
            <BarChart data={monthlyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip {...ttStyle} formatter={(v) => [fmt(v)]} />
              <Legend />
              {allCats.map((cat, i) => (
                <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[i % COLORS.length]} radius={i === allCats.length - 1 ? [4,4,0,0] : [0,0,0,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Merchants + Day of Week */}
      <div className="grid-2" style={{ marginTop: '20px' }}>
        <div className="card animate-in delay-3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <Store size={48} color="var(--accent)" style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0' }}>Merchant Analytics</h3>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '13px', maxWidth: '80%' }}>
            We've moved merchant and payee analytics to a dedicated, more detailed page.
          </p>
          <Link to="/merchants" className="btn btn-primary" style={{ marginTop: '16px', textDecoration: 'none' }}>
            View Merchants Page
          </Link>
        </div>

        {/* Spending by Day of Week */}
        <div className="card animate-in delay-3" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title">Spending by Day of Week</div>
            <span className="badge badge-purple">Peak: {velocity.peak_day_of_week}</span>
          </div>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocity.by_day_of_week} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => val.substring(0, 3).toUpperCase()} />
                <YAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                <Tooltip {...ttStyle} formatter={(v) => [fmt(v)]} />
                <Bar dataKey="total" fill="var(--accent)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Anomalies */}
      {anomalyList.length > 0 && (
        <div className="card animate-in delay-4" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <div className="card-title"><AlertTriangle size={16} color="var(--amber)" /> Anomalous Transactions ({anomalyList.length})</div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Counterparty</th><th>Amount</th><th>Severity</th><th>Explanation</th></tr>
              </thead>
              <tbody>
                {anomalyList.map((a, i) => (
                  <tr key={i}>
                    <td>{a.date}</td>
                    <td>{a.counterparty || '—'}</td>
                    <td className="amount-debit">{fmt(a.amount)}</td>
                    <td><span className={`badge ${a.severity === 'high' ? 'badge-red' : 'badge-amber'}`}>{a.severity}</span></td>
                    <td style={{ fontSize: '12px' }}>{a.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
