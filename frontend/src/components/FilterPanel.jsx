import React, { useState } from 'react';
import { useAnalysis } from '../App.jsx';
import { Filter, X } from 'lucide-react';

export default function FilterPanel() {
  const { data, setData, setFilterLoading } = useAnalysis();
  const [open, setOpen] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  
  const handleApply = async () => {
    setFilterLoading(true);
    try {
      const res = await fetch('http://localhost:8000/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: startDate || null,
          end_date: endDate || null,
          min_amount: minAmount ? parseFloat(minAmount) : null
        })
      });
      if (res.ok) {
        const newData = await res.json();
        // Preserve profile
        newData.profile = data.profile;
        setData(newData);
        setOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleClear = async () => {
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    // Re-fetch without filters
    setFilterLoading(true);
    try {
      const res = await fetch('http://localhost:8000/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const newData = await res.json();
        newData.profile = data.profile;
        setData(newData);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setFilterLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
      <button className="btn btn-ghost" onClick={() => setOpen(!open)}>
        <Filter size={16} /> Filters {startDate || endDate || minAmount ? '(Active)' : ''}
      </button>
      
      {open && (
        <div style={{ position: 'absolute', top: '40px', right: 0, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', boxShadow: 'var(--shadow-lg)', zIndex: 50, width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h4 style={{ margin: 0 }}>Advanced Filters</h4>
            <X size={16} style={{ cursor: 'pointer' }} onClick={() => setOpen(false)} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Month</label>
                <input 
                  type="month" 
                  className="filter-input" 
                  style={{ width: '100%', marginTop: '4px' }} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      const [year, month] = val.split('-');
                      setStartDate(`${year}-${month}-01`);
                      const lastDay = new Date(year, month, 0).getDate();
                      setEndDate(`${year}-${month}-${lastDay}`);
                    } else {
                      setStartDate('');
                      setEndDate('');
                    }
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="filter-input" style={{ width: '100%', marginTop: '4px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="filter-input" style={{ width: '100%', marginTop: '4px' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Min Amount (₦)</label>
              <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} className="filter-input" placeholder="0.00" style={{ width: '100%', marginTop: '4px' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={handleClear}>Clear</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleApply}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
