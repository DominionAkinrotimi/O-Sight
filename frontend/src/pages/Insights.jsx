import React, { useState } from 'react';
import { useAnalysis } from '../App.jsx';
import { Lightbulb, AlertTriangle, AlertCircle, Info, CheckCircle, Filter } from 'lucide-react';

const priorityConfig = {
  critical: { icon: AlertTriangle, color: 'var(--red)', label: 'Critical', bgClass: 'badge-red' },
  warning: { icon: AlertCircle, color: 'var(--amber)', label: 'Warning', bgClass: 'badge-amber' },
  info: { icon: Info, color: 'var(--blue)', label: 'Info', bgClass: 'badge-blue' },
  positive: { icon: CheckCircle, color: 'var(--green)', label: 'Positive', bgClass: 'badge-green' },
};

const categoryLabels = {
  spending: ' Spending',
  savings: ' Savings',
  income: ' Income',
  anomaly: ' Anomaly',
  habit: ' Habit',
  health: ' Health',
};

const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

export default function Insights() {
  const { data } = useAnalysis();
  const allInsights = data?.insights || [];
  const recurring = data?.recurring_payments || [];
  const health = data?.financial_health || {};

  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = allInsights.filter(i => {
    if (priorityFilter !== 'all' && i.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    return true;
  });

  const counts = {
    critical: allInsights.filter(i => i.priority === 'critical').length,
    warning: allInsights.filter(i => i.priority === 'warning').length,
    info: allInsights.filter(i => i.priority === 'info').length,
    positive: allInsights.filter(i => i.priority === 'positive').length,
  };

  return (
    <div>
      <div className="page-header animate-in">
        <h2>Insights & Recommendations</h2>
        <p>{allInsights.length} insights generated from your financial data — sorted by priority</p>
      </div>

      {/* Priority Summary Badges */}
      <div className="animate-in delay-1" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {Object.entries(counts).map(([key, count]) => {
          const cfg = priorityConfig[key];
          return (
            <button
              key={key}
              className={`btn ${priorityFilter === key ? 'btn-primary' : 'btn-ghost'}`}
              style={priorityFilter === key ? { background: cfg.color } : {}}
              onClick={() => setPriorityFilter(priorityFilter === key ? 'all' : key)}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
        <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="spending">Spending</option>
          <option value="savings">Savings</option>
          <option value="income">Income</option>
          <option value="anomaly">Anomaly</option>
          <option value="habit">Habit</option>
          <option value="health">Health</option>
        </select>
      </div>

      {/* Insight Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map((ins, i) => {
          const cfg = priorityConfig[ins.priority] || priorityConfig.info;
          const Icon = cfg.icon;

          return (
            <div key={ins.id} className={`insight-card ${ins.priority} animate-in`} style={{ animationDelay: `${i * 0.03}s` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ marginTop: '2px', flexShrink: 0 }}>
                  <Icon size={18} color={cfg.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span className="insight-title">{ins.title}</span>
                    <span className={`badge ${cfg.bgClass}`}>{cfg.label}</span>
                    <span className="badge badge-purple">{categoryLabels[ins.category] || ins.category}</span>
                    {ins.amount > 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{fmt(ins.amount)}</span>}
                  </div>
                  <div className="insight-desc">{ins.description}</div>
                  {ins.recommendation && (
                    <div className="insight-rec">
                       <strong>Recommendation:</strong> {ins.recommendation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Lightbulb size={40} color="var(--text-muted)" />
          <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>No insights match your current filters.</p>
        </div>
      )}

      {/* Recurring Payments Section */}
      {recurring.length > 0 && (
        <div className="card animate-in delay-3" style={{ marginTop: '28px' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="card-title"> Detected Recurring Payments</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }} title="Payments made consistently over time, like subscriptions or utility bills.">
              <Info size={14} />
            </div>
            <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>{recurring.length} found</span>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Recipient</th><th>Amount</th><th>Frequency</th><th>Count</th><th>Total Spent</th><th>Est. Monthly</th><th>Last Payment</th></tr>
              </thead>
              <tbody>
                {recurring.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{r.counterparty}</td>
                    <td>{fmt(r.estimated_amount)}</td>
                    <td><span className="badge badge-blue">{r.frequency}</span></td>
                    <td>{r.count}x</td>
                    <td className="amount-debit">{fmt(r.total_spent)}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(r.monthly_cost)}</td>
                    <td>{r.last_payment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Health Breakdown */}
      <div className="card animate-in delay-4" style={{ marginTop: '28px' }}>
        <div className="card-header">
          <div className="card-title"> Financial Health Breakdown</div>
          <span className={`badge ${health.overall >= 70 ? 'badge-green' : health.overall >= 50 ? 'badge-amber' : 'badge-red'}`}>
            Grade: {health.grade} ({health.overall}/100)
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {Object.entries(health.factors || {}).map(([key, f]) => {
            const color = f.score >= 70 ? 'var(--green)' : f.score >= 50 ? 'var(--amber)' : 'var(--red)';
            return (
              <div key={key} style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color }}>{f.score}/100</span>
                </div>
                <div className="progress-bar" style={{ marginBottom: '8px' }}>
                  <div className="progress-fill" style={{ width: `${f.score}%`, background: color }} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{f.detail}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Weight: {f.weight}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
