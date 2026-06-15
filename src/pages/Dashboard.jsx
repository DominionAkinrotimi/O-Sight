import React from 'react';
import { useAnalysis } from '../App.jsx';
import { TrendingUp, TrendingDown, Wallet, Activity, Users, ArrowUpRight, ArrowDownRight, AlertTriangle, Info } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush } from 'recharts';

const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

function ScoreRing({ score, grade }) {
  const r = 56, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';

  return (
    <div className="score-ring">
      <svg width="140" height="140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="score-ring-value">
        <div className="score-number" style={{ color }}>{score}</div>
        <div className="score-grade">{grade}</div>
      </div>
    </div>
  );
}

const chartTooltipStyle = {
  contentStyle: { background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '12px' },
  labelStyle: { color: '#94a3b8' },
};

export default function Dashboard() {
  const { data } = useAnalysis();
  if (!data) return null;

  const { overview, monthly_trends, financial_health, insights, merchant_ranking, balance_trend } = data;
  const recon = overview.reconciliation;

  const topInsights = (insights || []).slice(0, 4);
  const topMerchants = (merchant_ranking || []).slice(0, 5);

  return (
    <div>
      <div className="page-header animate-in">
        <h2>Dashboard Overview</h2>
        <p>Statement period: {overview.date_range.start} to {overview.date_range.end} • {overview.total_transactions} transactions</p>
      </div>

      {/* Reconciliation Warning */}
      {!recon.is_balanced && (
        <div className="card animate-in delay-1" style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <AlertTriangle size={20} color="var(--amber)" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--amber)' }}>Accounting Discrepancy Detected</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{recon.discrepancies[0]}</div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stat-grid animate-in delay-1">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}><TrendingUp size={22} /></div>
          <div>
            <div className="stat-label">Total Inflow</div>
            <div className="stat-value">{fmt(overview.total_inflow)}</div>
            <div className="stat-sub" style={{ display: 'flex', flexDirection: 'column' }}>
              <span>{overview.inflow_transactions} transactions</span>
              <span style={{ fontSize: '10px', color: 'var(--amber)', marginTop: '2px' }}>
                Includes {fmt(overview.internal_sweeps_in)} in internal sweeps
              </span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}><TrendingDown size={22} /></div>
          <div>
            <div className="stat-label">Total Outflow</div>
            <div className="stat-value">{fmt(overview.total_outflow)}</div>
            <div className="stat-sub" style={{ display: 'flex', flexDirection: 'column' }}>
              <span>{overview.outflow_transactions} transactions</span>
              <span style={{ fontSize: '10px', color: 'var(--amber)', marginTop: '2px' }}>
                Includes {fmt(overview.internal_sweeps_out)} in internal sweeps
              </span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: overview.net_flow >= 0 ? 'var(--green-bg)' : 'var(--red-bg)', color: overview.net_flow >= 0 ? 'var(--green)' : 'var(--red)' }}>
            <Wallet size={22} />
          </div>
          <div>
            <div className="stat-label">Net Flow</div>
            <div className="stat-value" style={{ color: overview.net_flow >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(overview.net_flow)}</div>
            <div className="stat-sub">{overview.savings_rate}% savings rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}><Users size={22} /></div>
          <div>
            <div className="stat-label">Counterparties</div>
            <div className="stat-value">{overview.unique_counterparties}</div>
            <div className="stat-sub">unique people/merchants</div>
          </div>
        </div>
      </div>

      <div className="animate-in delay-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', marginTop: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <Info size={16} color="var(--amber)" style={{ flexShrink: 0 }} />
        <span><strong>Internal sweeps</strong> represent money moved between your own accounts, savings, or automated sweeps to/from OWealth. These are subtracted to show your true income and spending.</span>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginTop: '20px' }}>
        {/* Balance Over Time */}
        <div className="card animate-in delay-2">
          <div className="card-header">
            <div className="card-title"><Activity size={16} /> Balance Over Time</div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer>
              <AreaChart data={balance_trend.timeline}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                <Tooltip {...chartTooltipStyle} formatter={(v) => [`${fmt(v)}`, 'Balance']} />
                <Area type="monotone" dataKey="balance" stroke="var(--accent)" fill="url(#balGrad)" strokeWidth={2} />
                <Brush dataKey="date" height={30} stroke="var(--accent)" fill="var(--bg-secondary)" tickFormatter={() => ''} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Inflow vs Outflow */}
        <div className="card animate-in delay-3">
          <div className="card-header">
            <div className="card-title"><TrendingUp size={16} /> Monthly Inflow vs Outflow</div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer>
              <BarChart data={monthly_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                <Tooltip {...chartTooltipStyle} formatter={(v) => [fmt(v)]} />
                <Legend />
                <Bar dataKey="inflow" name="Inflow" fill="var(--green)" radius={[4,4,0,0]} />
                <Bar dataKey="outflow" name="Outflow" fill="var(--red)" radius={[4,4,0,0]} opacity={0.7} />
                <Brush dataKey="month" height={30} stroke="var(--accent)" fill="var(--bg-secondary)" tickFormatter={() => ''} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Score + Merchants + Insights */}
      <div className="grid-3" style={{ marginTop: '20px' }}>
        {/* Financial Health Score */}
        <div className="card animate-in delay-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card-title" style={{ marginBottom: '16px' }}>Financial Health</div>
          <ScoreRing score={financial_health.overall} grade={financial_health.grade} />
          <div style={{ marginTop: '16px', width: '100%' }}>
            {Object.entries(financial_health.factors).slice(0, 4).map(([key, f]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: f.score >= 70 ? 'var(--green)' : f.score >= 50 ? 'var(--amber)' : 'var(--red)' }}>{f.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Merchants */}
        <div className="card animate-in delay-4">
          <div className="card-header">
            <div className="card-title">Top Recipients</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topMerchants.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `hsl(${i * 60 + 220}, 60%, 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff' }}>
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{m.name.length > 18 ? m.name.slice(0,18)+'…' : m.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.count} txns</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{fmt(m.total)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="card animate-in delay-5">
          <div className="card-header">
            <div className="card-title"><Activity size={16} /> Quick Insights</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topInsights.map((ins) => (
              <div key={ins.id} className={`insight-card ${ins.priority}`} style={{ padding: '12px' }}>
                <div className="insight-title" style={{ fontSize: '12px' }}>{ins.title}</div>
                <div className="insight-desc" style={{ fontSize: '11px', marginBottom: 0 }}>{ins.description.slice(0, 100)}{ins.description.length > 100 ? '…' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
