import React, { useState, useMemo } from 'react';
import { useAnalysis } from '../App.jsx';
import { Search, Download, ArrowUpDown, Filter } from 'lucide-react';

const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

export default function Transactions() {
  const { data } = useAnalysis();
  const allTx = data?.transactions || [];

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [flowFilter, setFlowFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [sortBy, setSortBy] = useState('Date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const perPage = 25;

  const categories = useMemo(() => [...new Set(allTx.map(t => t.Category))].sort(), [allTx]);
  const months = useMemo(() => [...new Set(allTx.map(t => t.Date?.slice(0, 7)))].sort(), [allTx]);

  const filtered = useMemo(() => {
    let result = [...allTx];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        (t.Description || '').toLowerCase().includes(q) ||
        (t.Counterparty || '').toLowerCase().includes(q) ||
        (t.Narration || '').toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') result = result.filter(t => t.Category === categoryFilter);
    if (flowFilter === 'inflow') result = result.filter(t => t.Credit > 0);
    if (flowFilter === 'outflow') result = result.filter(t => t.Debit > 0);
    if (monthFilter !== 'all') result = result.filter(t => t.Date?.startsWith(monthFilter));

    result.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (typeof va === 'number' && typeof vb === 'number') return sortOrder === 'asc' ? va - vb : vb - va;
      return sortOrder === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });

    return result;
  }, [allTx, search, categoryFilter, flowFilter, monthFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (col) => {
    if (sortBy === col) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortOrder('desc'); }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Counterparty', 'Debit', 'Credit', 'Balance'];
    const rows = filtered.map(t => headers.map(h => t[h] ?? ''));
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transactions_export.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const totalDebit = filtered.reduce((s, t) => s + (t.Debit || 0), 0);
  const totalCredit = filtered.reduce((s, t) => s + (t.Credit || 0), 0);

  return (
    <div>
      <div className="page-header animate-in">
        <h2>Transactions</h2>
        <p>Search, filter, and explore every transaction in your statement</p>
      </div>

      {/* Filters */}
      <div className="filters-bar animate-in delay-1">
        <input
          type="text"
          className="filter-input search-input"
          placeholder="Search descriptions, counterparties, narrations..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="filter-select" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="filter-select" value={flowFilter} onChange={(e) => { setFlowFilter(e.target.value); setPage(1); }}>
          <option value="all">All Flows</option>
          <option value="inflow">Inflows Only</option>
          <option value="outflow">Outflows Only</option>
        </select>
        <select className="filter-select" value={monthFilter} onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}>
          <option value="all">All Months</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={exportCSV}><Download size={14} /> Export CSV</button>
      </div>

      {/* Summary Bar */}
      <div className="animate-in delay-1" style={{ display: 'flex', gap: '24px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <span><strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> transactions</span>
        <span>Total Debit: <strong className="amount-debit">{fmt(totalDebit)}</strong></span>
        <span>Total Credit: <strong className="amount-credit">{fmt(totalCredit)}</strong></span>
      </div>

      {/* Table */}
      <div className="card animate-in delay-2" style={{ padding: 0, overflow: 'hidden', width: '100%' }}>
        <div className="data-table-wrapper" style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table className="data-table" style={{ minWidth: '800px', width: '100%' }}>
            <thead>
              <tr>
                {['Date', 'Description', 'Category', 'Counterparty', 'Debit', 'Credit', 'Balance'].map(col => (
                  <th key={col} onClick={() => handleSort(col)} style={{ cursor: 'pointer' }}>
                    {col} {sortBy === col && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((t, i) => (
                <tr key={i}>
                  <td style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{t.Date}</td>
                  <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.Description}>{t.Description}</td>
                  <td><span className={`badge ${t.Category.includes('Savings') ? 'badge-green' : t.Category.includes('Charges') ? 'badge-red' : t.Category.includes('Transfer') ? 'badge-blue' : 'badge-purple'}`}>{t.Category}</span></td>
                  <td>{t.Counterparty || '—'}</td>
                  <td className={t.Debit > 0 ? 'amount-debit' : ''}>{t.Debit > 0 ? fmt(t.Debit) : '—'}</td>
                  <td className={t.Credit > 0 ? 'amount-credit' : ''}>{t.Credit > 0 ? fmt(t.Credit) : '—'}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(t.Balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
