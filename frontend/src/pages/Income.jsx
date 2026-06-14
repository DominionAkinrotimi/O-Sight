import React from 'react';
import { useAnalysis } from '../App.jsx';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, TrendingUp, Shield, Activity } from 'lucide-react';

const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const ttStyle = {
  contentStyle: { background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '12px' },
};

function StabilityGauge({ score }) {
  const color = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--amber)' : 'var(--red)';
  const label = score >= 70 ? 'Stable' : score >= 40 ? 'Moderate' : 'Volatile';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '48px', fontWeight: 800, color, letterSpacing: '-2px' }}>{score}</div>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{label}</div>
      <div className="progress-bar" style={{ height: '10px' }}>
        <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

function SourceItem({ s, i }) {
  const [expanded, setExpanded] = React.useState(false);
  const hasTwins = s.sub_entities && s.sub_entities.length > 1;
  return (
    <div style={{ cursor: hasTwins ? 'pointer' : 'default', paddingBottom: '4px' }} onClick={() => hasTwins && setExpanded(!expanded)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '13px', fontWeight: 500 }}>
          {s.name.length > 25 ? s.name.slice(0,25)+'…' : s.name} 
          {hasTwins && <span style={{ fontSize: '10px', color: 'var(--amber)', marginLeft: '4px' }}>(2+ Accounts)</span>}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{fmt(s.total)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({s.percentage}%)</span></span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${s.percentage}%`, background: `hsl(${150 + i * 30}, 60%, 50%)` }} />
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.count} transactions</div>
      
      {expanded && hasTwins && (
        <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Merged Entities (Evil Twins)</div>
          {s.sub_entities.map((sub, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', padding: '4px 0', borderBottom: idx < s.sub_entities.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <span>{sub.name} <span style={{ opacity: 0.5, marginLeft: '4px' }}>{sub.account}</span></span>
              <span>{fmt(sub.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Income() {
  const { data } = useAnalysis();
  if (!data) return null;

  const { income_analysis } = data;
  const { total_income, sources, monthly, stability_score, avg_monthly_income, source_count, income_vs_spending } = income_analysis;

  return (
    <div>
      <div className="page-header animate-in">
        <h2>Income Analysis</h2>
        <p>Understand your income sources, stability, and patterns</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid animate-in delay-1">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}><TrendingUp size={22} /></div>
          <div>
            <div className="stat-label">Total Income</div>
            <div className="stat-value">{fmt(total_income)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}><Activity size={22} /></div>
          <div>
            <div className="stat-label">Avg Monthly Income</div>
            <div className="stat-value">{fmt(avg_monthly_income)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}><Users size={22} /></div>
          <div>
            <div className="stat-label">Income Sources</div>
            <div className="stat-value">{source_count}</div>
            <div className="stat-sub">{source_count >= 3 ? 'Well diversified' : source_count === 1 ? 'Single source risk' : 'Could improve'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: stability_score >= 70 ? 'var(--green-bg)' : 'var(--amber-bg)', color: stability_score >= 70 ? 'var(--green)' : 'var(--amber)' }}>
            <Shield size={22} />
          </div>
          <div>
            <div className="stat-label">Stability Score</div>
            <div className="stat-value">{stability_score}/100</div>
            <div className="stat-sub">{stability_score >= 70 ? 'Consistent income' : 'High variability'}</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '20px' }}>
        {/* Income Stability Gauge */}
        <div className="card animate-in delay-2" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header"><div className="card-title"><Shield size={16} /> Income Stability</div></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <div style={{ padding: '0 0 16px 0' }}>
              <StabilityGauge score={stability_score} />
            </div>
            
            {/* Sparkline for Monthly Trend */}
            <div style={{ height: '80px', marginBottom: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip 
                    cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                    contentStyle={{ background: '#111827', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val) => [fmt(val), 'Income']}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--green)" fill="var(--green-bg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ padding: '16px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', marginTop: 'auto' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.6', marginBottom: '10px' }}>
                {stability_score >= 70
                  ? 'Your income is highly consistent month to month. This makes budgeting and planning much easier.'
                  : stability_score >= 40
                  ? 'Your income varies moderately. Consider building a buffer for lower-income months.'
                  : 'Your income is unpredictable. Build at least 3 months of expenses as an emergency fund.'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.5', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <strong>Why this score?</strong> Your average monthly income is {fmt(avg_monthly_income)}, but your actual monthly income fluctuates between {monthly.length > 0 ? fmt(Math.min(...monthly.map(m => m.total))) : '₦0'} and {monthly.length > 0 ? fmt(Math.max(...monthly.map(m => m.total))) : '₦0'}. You also rely on {source_count} income source(s). Large fluctuations and relying on fewer sources lower your stability score.
              </p>
            </div>
          </div>
        </div>

        {/* Top Income Sources */}
        <div className="card animate-in delay-2">
          <div className="card-header"><div className="card-title"><Users size={16} /> Income Sources</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sources.slice(0, 8).map((s, i) => (
              <SourceItem key={s.name} s={s} i={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Income Chart */}
      <div className="card animate-in delay-3" style={{ marginTop: '20px' }}>
        <div className="card-header"><div className="card-title">Monthly Income</div></div>
        <div className="chart-container">
          <ResponsiveContainer>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip {...ttStyle} formatter={(v) => [fmt(v)]} />
              <Bar dataKey="total" name="Income" fill="var(--green)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income vs Spending Overlay */}
      <div className="card animate-in delay-4" style={{ marginTop: '20px' }}>
        <div className="card-header"><div className="card-title">Income vs Spending (Monthly)</div></div>
        <div className="chart-container-lg">
          <ResponsiveContainer>
            <AreaChart data={income_vs_spending}>
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--red)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--red)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip {...ttStyle} formatter={(v) => [fmt(v)]} />
              <Legend />
              <Area type="monotone" dataKey="income" name="Income" stroke="var(--green)" fill="url(#incGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="spending" name="Spending" stroke="var(--red)" fill="url(#spendGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
