import React, { useState, useMemo } from 'react';
import { useAnalysis } from '../App.jsx';
import { Store, Search, ArrowUpDown, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Merchants() {
  const { data } = useAnalysis();
  const merchants = data.merchant_ranking || [];
  const allTxns = data.transactions || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('total');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedMerchantName, setSelectedMerchantName] = useState(null);
  
  const [txnSearchTerm, setTxnSearchTerm] = useState('');
  const [txnPage, setTxnPage] = useState(1);
  const txnItemsPerPage = 10;

  const fmt = (num) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(num || 0);

  const filteredMerchants = useMemo(() => {
    return merchants.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [merchants, searchTerm]);

  const sortedMerchants = useMemo(() => {
    return [...filteredMerchants].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredMerchants, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const selectedMerchant = useMemo(() => {
    return merchants.find(m => m.name === selectedMerchantName) || sortedMerchants[0];
  }, [selectedMerchantName, merchants, sortedMerchants]);

  // Derive merchant transactions
  const merchantTxns = useMemo(() => {
    if (!selectedMerchant) return [];
    return allTxns.filter(t => t.Parent_Entity === selectedMerchant.name && t.Debit > 0)
                  .sort((a,b) => new Date(b.Date) - new Date(a.Date));
  }, [selectedMerchant, allTxns]);

  // Derived filtered transactions (for inner search)
  const filteredTxns = useMemo(() => {
    return merchantTxns.filter(t => t.Description.toLowerCase().includes(txnSearchTerm.toLowerCase()));
  }, [merchantTxns, txnSearchTerm]);
  
  const txnTotalPages = Math.ceil(filteredTxns.length / txnItemsPerPage);
  const paginatedTxns = filteredTxns.slice((txnPage - 1) * txnItemsPerPage, txnPage * txnItemsPerPage);

  // Group by month for the chart
  const monthlyData = useMemo(() => {
    if (!selectedMerchant) return [];
    const groups = {};
    merchantTxns.forEach(t => {
      const d = new Date(t.Date);
      const m = d.toLocaleString('default', { month: 'short' });
      const y = d.getFullYear();
      const key = `${m} ${y}`;
      if (!groups[key]) groups[key] = { month: key, total: 0 };
      groups[key].total += t.Debit;
    });
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Object.values(groups).sort((a,b) => {
      const [m1,y1] = a.month.split(' ');
      const [m2,y2] = b.month.split(' ');
      if (y1 !== y2) return y1 - y2;
      return months.indexOf(m1) - months.indexOf(m2);
    });
  }, [merchantTxns]);

  return (
    <div className="animate-in" style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 140px)', overflow: 'hidden' }}>
      
      {/* LEFT PANE: Merchant List */}
      <div className="card" style={{ width: '35%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={20} color="var(--accent)" />
            Merchants ({filteredMerchants.length})
          </h3>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="filter-input" 
              placeholder="Search merchants..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px', fontSize: '13px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span style={{ cursor: 'pointer', color: sortField === 'name' ? 'var(--accent)' : '' }} onClick={() => handleSort('name')}>Name <ArrowUpDown size={10} /></span>
            <span style={{ cursor: 'pointer', color: sortField === 'total' ? 'var(--accent)' : '' }} onClick={() => handleSort('total')}>Total <ArrowUpDown size={10} /></span>
            <span style={{ cursor: 'pointer', color: sortField === 'count' ? 'var(--accent)' : '' }} onClick={() => handleSort('count')}>Freq <ArrowUpDown size={10} /></span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {sortedMerchants.map(m => {
            const isSelected = selectedMerchant?.name === m.name;
            return (
              <div 
                key={m.name}
                onClick={() => { setSelectedMerchantName(m.name); setTxnPage(1); setTxnSearchTerm(''); }}
                style={{ 
                  padding: '16px', 
                  borderBottom: '1px solid var(--border)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: isSelected ? 'var(--accent)' : 'var(--text)' }}>{m.name}</div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{fmt(m.total)}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>{m.count} txns • Avg {fmt(m.avg)}</span>
                  <span>{m.last_date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANE: Details View */}
      <div style={{ width: '65%', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '4px' }}>
        {selectedMerchant ? (
          <>
            {/* Header Card */}
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0' }}>{selectedMerchant.name}</h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {selectedMerchant.count} transactions totaling <strong>{fmt(selectedMerchant.total)}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Average Spend</div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>{fmt(selectedMerchant.avg)}</div>
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="card">
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={16} color="var(--accent)" />
                <h3 style={{ margin: 0 }}>Monthly Spending Trend</h3>
              </div>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{fontSize: 11}} />
                    <YAxis stroke="var(--text-secondary)" tickFormatter={val => '₦'+(val/1000).toFixed(0)+'k'} tick={{fontSize: 11}} />
                    <Tooltip 
                      cursor={{fill: 'var(--surface-2)'}}
                      contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                      formatter={(val) => [fmt(val), 'Spent']}
                    />
                    <Bar dataKey="total" fill="var(--accent)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transaction List */}
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Transaction History</h3>
                <div style={{ position: 'relative', width: '250px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    className="filter-input" 
                    placeholder="Search descriptions (e.g. food)..." 
                    value={txnSearchTerm}
                    onChange={e => { setTxnSearchTerm(e.target.value); setTxnPage(1); }}
                    style={{ width: '100%', paddingLeft: '32px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>Date</th>
                      <th style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>Description</th>
                      <th style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTxns.map((t, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{new Date(t.Date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</td>
                        <td style={{ padding: '12px', fontSize: '13px' }}>{t.Description}</td>
                        <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600, textAlign: 'right', color: 'var(--red)' }}>{fmt(t.Debit)}</td>
                      </tr>
                    ))}
                    {paginatedTxns.length === 0 && (
                      <tr>
                        <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No transactions found matching your search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {txnTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Showing {(txnPage - 1) * txnItemsPerPage + 1} to {Math.min(txnPage * txnItemsPerPage, filteredTxns.length)} of {filteredTxns.length}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost" onClick={() => setTxnPage(p => Math.max(1, p - 1))} disabled={txnPage === 1} style={{ padding: '6px' }}>
                      <ChevronLeft size={16} />
                    </button>
                    <button className="btn btn-ghost" onClick={() => setTxnPage(p => Math.min(txnTotalPages, p + 1))} disabled={txnPage === txnTotalPages} style={{ padding: '6px' }}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="card" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Select a merchant from the list to view detailed analytics.
          </div>
        )}
      </div>

    </div>
  );
}
