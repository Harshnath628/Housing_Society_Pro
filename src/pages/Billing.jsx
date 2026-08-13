import { useState } from 'react';
import Modal from '../components/Modal';
import { MAINTENANCE_RATE_PER_SQFT } from '../data/mockData';
import { generateBills } from '../lib/api';

export default function Billing({ societyId, buildings, flats, bills, setBills, payments }) {
  const [showBulk, setShowBulk] = useState(false);
  const [bulkMonth, setBulkMonth] = useState('');
  const [bulkMode, setBulkMode] = useState('per_sqft');
  const [bulkFixedAmount, setBulkFixedAmount] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [error, setError] = useState('');

  const fmt = n => '₹' + n.toLocaleString('en-IN');

  const months = [...new Set(bills.map(b => b.month))].sort().reverse();
  const filtered = filterMonth === 'all' ? bills : bills.filter(b => b.month === filterMonth);

  const generateBulk = async () => {
    if (!bulkMonth) {
      setError('Select a month to generate bills for.');
      return;
    }
    if (bulkMode === 'fixed' && !bulkFixedAmount) {
      setError('Enter a fixed amount per flat.');
      return;
    }
    setError('');
    const existing = bills.filter(b => b.month === bulkMonth).map(b => b.flatId);
    const newBills = flats.filter(f => !existing.includes(f.id)).map(f => {
      const amount = bulkMode === 'per_sqft' ? f.area * MAINTENANCE_RATE_PER_SQFT : +bulkFixedAmount;
      const pendingBills = bills.filter(b => b.flatId === f.id && b.status !== 'Paid');
      const pendingDues = pendingBills.reduce((s, b) => {
        const paid = payments.filter(p => p.billId === b.id).reduce((ps, p) => ps + p.amount, 0);
        return s + (b.totalDue - paid);
      }, 0);
      return {
        flatId: f.id,
        month: bulkMonth,
        amount,
        pendingDues,
        totalDue: amount + pendingDues,
        status: 'Pending',
        generatedAt: new Date().toISOString().split('T')[0]
      };
    });
    if (newBills.length === 0) {
      setError('Bills are already generated for every flat this month.');
      return;
    }
    try {
      const created = await generateBills(societyId, newBills);
      setBills(prev => [...prev, ...created]);
      setShowBulk(false);
      alert(`Generated ${created.length} bills for ${bulkMonth}`);
    } catch (err) {
      setError(err.message || 'Could not generate bills.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Billing</h2>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowBulk(true); }}>Generate Monthly Bills</button>
      </div>

      <div className="filter-bar">
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value="all">All Months</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{filtered.length} bills</span>
      </div>

      <div className="card">
        <div className="card-body table-wrap">
          <table>
            <thead>
              <tr><th>Flat</th><th>Month</th><th>Amount</th><th>Pending Dues</th><th>Total Due</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const flat = flats.find(f => f.id === b.flatId);
                return (
                  <tr key={b.id}>
                    <td><span className="font-mono" style={{ fontWeight: 600 }}>{flat?.flatNumber || '—'}</span></td>
                    <td>{b.month}</td>
                    <td>{fmt(b.amount)}</td>
                    <td>{b.pendingDues > 0 ? <span style={{ color: 'var(--rose)' }}>{fmt(b.pendingDues)}</span> : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(b.totalDue)}</td>
                    <td>
                      <span className={`badge ${b.status === 'Paid' ? 'badge-success' : b.status === 'Partial' ? 'badge-warning' : 'badge-danger'}`}>{b.status}</span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center" style={{ padding: 20, color: 'var(--text-muted)' }}>No bills found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showBulk} onClose={() => setShowBulk(false)} title="Generate Monthly Bills"
        footer={<><button className="btn btn-outline" onClick={() => setShowBulk(false)}>Cancel</button><button className="btn btn-primary" onClick={generateBulk}>Generate</button></>}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-group">
          <label>Month</label>
          <input className="form-control" type="month" value={bulkMonth} onChange={e => setBulkMonth(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Rate Mode</label>
          <select className="form-control" value={bulkMode} onChange={e => setBulkMode(e.target.value)}>
            <option value="per_sqft">Per Square Foot (₹{MAINTENANCE_RATE_PER_SQFT}/sqft)</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>
        {bulkMode === 'fixed' && (
          <div className="form-group">
            <label>Fixed Amount (₹)</label>
            <input className="form-control" type="number" value={bulkFixedAmount} onChange={e => setBulkFixedAmount(e.target.value)} placeholder="5000" />
          </div>
        )}
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
          Bills will be generated for {flats.length} flats. Existing bills for the selected month will be skipped. Previous pending dues will be carried forward.
        </p>
      </Modal>
    </div>
  );
}
