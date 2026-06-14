import React from 'react';
import { useAnalysis } from '../App.jsx';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PiggyBank, Target, TrendingUp, Calendar, Info } from 'lucide-react';

const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const ttStyle = {
  contentStyle: { background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '12px' },
};

export default function Savings() {
  const { data } = useAnalysis();
  if (!data) return null;

  const { savings_analysis } = data;
  const { total_saved, net_saved, total_withdrawn, savings_rate, breakdown, monthly, avg_monthly_savings, projections } = savings_analysis;

  const projectionItems = [
    { label: '₦500K', key: '500k', target: 500000 },
    { label: '₦1M', key: '1m', target: 1000000 },
    { label: '₦5M', key: '5m', target: 5000000 },
  ];

  return (
    <div>
      <div className="page-header animate-in">
        <h2>Savings & Goals</h2>
        <p>Track your savings progress, breakdown, and projections</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid animate-in delay-1">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: net_saved < 0 ? 'var(--red-bg)' : 'var(--green-bg)', color: net_saved < 0 ? 'var(--red)' : 'var(--green)' }}><PiggyBank size={22} /></div>
          <div>
            <div className="stat-label">Net Saved</div>
            <div className="stat-value" style={{ color: net_saved < 0 ? 'var(--red)' : 'var(--green)' }}>{fmt(net_saved !== undefined ? net_saved : total_saved)}</div>
            {total_withdrawn !== undefined && (
              <div className="stat-sub">
                Gross: {fmt(total_saved)} • Withdrawn: {fmt(total_withdrawn)}
                {net_saved < 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '6px', color: 'var(--amber)', cursor: 'help' }} title="Negative net savings means you withdrew more than you deposited this period (drawing on previous balance).">
                    <Info size={12} />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}><TrendingUp size={22} /></div>
          <div>
            <div className="stat-label">Savings Rate</div>
            <div className="stat-value">{savings_rate}%</div>
            <div className="stat-sub">{savings_rate >= 20 ? 'Excellent!' : savings_rate >= 10 ? 'Good — aim for 20%' : 'Needs improvement'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}><Calendar size={22} /></div>
          <div>
            <div className="stat-label">Avg Monthly Savings</div>
            <div className="stat-value">{fmt(avg_monthly_savings)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}><Target size={22} /></div>
          <div>
            <div className="stat-label">Savings Products</div>
            <div className="stat-value">{breakdown.length}</div>
            <div className="stat-sub">active types</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '20px' }}>
        {/* Savings Breakdown */}
        <div className="card animate-in delay-2">
          <div className="card-header"><div className="card-title"><PiggyBank size={16} /> Savings Breakdown</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {breakdown.length > 0 ? breakdown.map((b, i) => {
              const colors = ['var(--green)', 'var(--blue)', 'var(--purple)', 'var(--amber)'];
              const color = colors[i % colors.length];
              return (
                <div key={b.type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{b.type}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{fmt(b.amount)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({b.percentage}%)</span></span>
                  </div>
                  <div className="progress-bar" style={{ height: '10px' }}>
                    <div className="progress-fill" style={{ width: `${b.percentage}%`, background: color }} />
                  </div>
                  {b.amount_withdrawn !== undefined && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Gross Saved: {fmt(b.amount_saved)} • Withdrawn: {fmt(b.amount_withdrawn)}
                      {b.amount < 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '6px', color: 'var(--amber)', cursor: 'help' }} title="More withdrawn than deposited.">
                          <Info size={10} />
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            }) : <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No savings transactions detected.</p>}
          </div>
        </div>

        {/* Savings Projections */}
        <div className="card animate-in delay-2">
          <div className="card-header"><div className="card-title"><Target size={16} /> Savings Projections</div></div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
            Based on your average monthly savings of <strong style={{ color: 'var(--green)' }}>{fmt(avg_monthly_savings)}</strong>, here's how long it will take to reach key milestones:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {projectionItems.map(({ label, key, target }) => {
              const months = projections[key];
              const progress = Math.min(100, (Math.max(0, net_saved !== undefined ? net_saved : total_saved) / target) * 100);
              const reachable = months > 0;
              const years = months > 12 ? `${Math.floor(months / 12)}y ${months % 12}m` : `${months} months`;

              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: '13px', color: reachable ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                      {reachable ? years : (months === 0 ? 'Achieved!' : 'Off Track')}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: '12px' }}>
                    <div className="progress-fill" style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, var(--accent), var(--purple))`,
                    }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {progress.toFixed(1)}% reached ({fmt(total_saved)} / {label})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Savings Chart */}
      <div className="card animate-in delay-3" style={{ marginTop: '20px' }}>
        <div className="card-header"><div className="card-title">Monthly Savings</div></div>
        <div className="chart-container">
          <ResponsiveContainer>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip {...ttStyle} formatter={(v, name) => [name === 'rate' ? `${v}%` : fmt(v), name === 'rate' ? 'Rate' : 'Saved']} />
              <Area type="monotone" dataKey="amount" name="Amount Saved" stroke="var(--green)" fill="url(#savGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Savings Rate */}
      <div className="card animate-in delay-4" style={{ marginTop: '20px' }}>
        <div className="card-header"><div className="card-title">Monthly Savings Rate (%)</div></div>
        <div className="chart-container">
          <ResponsiveContainer>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
              <Tooltip {...ttStyle} formatter={(v) => [`${v}%`, 'Savings Rate']} />
              <Bar dataKey="rate" name="Savings Rate %" fill="var(--accent)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
