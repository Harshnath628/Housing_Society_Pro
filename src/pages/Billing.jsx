import { useState } from 'react';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';
import { MAINTENANCE_RATE_PER_SQFT } from '../data/mockData';
import { generateBills } from '../lib/api';

export default function Billing({ societyId, buildings, flats, bills, setBills, payments }) {
  const [showBulk, setShowBulk] = useState(false);
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [bulkMonth, setBulkMonth] = useState(defaultMonth);
  const [bulkMode, setBulkMode] = useState('per_sqft');
  const [bulkFixedAmount, setBulkFixedAmount] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fmt = n => '₹' + n.toLocaleString('en-IN');

  const months = [...new Set(bills.map(b => b.month))].sort().reverse();
  const filtered = filterMonth === 'all' ? bills : bills.filter(b => b.month === filterMonth);

  const openBulk = () => {
    setError('');
    setBulkMonth(defaultMonth);
    setBulkMode('per_sqft');
    setBulkFixedAmount('');
    setShowBulk(true);
  };

  const generateBulk = async (e) => {
    e?.preventDefault?.();
    if (!bulkMonth) {
      setError('Select a month to generate bills for.');
      return;
    }
    if (bulkMode === 'fixed' && !bulkFixedAmount) {
      setError('Enter a fixed amount per flat.');
      return;
    }
    setError('');
    setSaving(true);
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
    const zeroAreaFlats = newBills.filter(b => b.amount === 0);
    if (bulkMode === 'per_sqft' && zeroAreaFlats.length > 0) {
      setError(`${zeroAreaFlats.length} flat(s) have 0 sqft area and will generate ₹0 bills. Set their area first, or use Fixed Amount mode.`);
      setSaving(false);
      return;
    }
    if (newBills.length === 0) {
      setError('Bills are already generated for every flat this month.');
      setSaving(false);
      return;
    }
    try {
      const created = await generateBills(societyId, newBills);
      setBills(prev => [...prev, ...created]);
      setShowBulk(false);
      showToast(`Generated ${created.length} bills for ${bulkMonth}`);
    } catch (err) {
      setError(err.message || 'Could not generate bills.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Billing</h2>
        <button className="btn btn-primary" onClick={openBulk}>Generate Monthly Bills</button>
      </div>

      <div className="filter-bar">
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} aria-label="Filter by month">
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
        footer={<><button className="btn btn-outline" onClick={() => setShowBulk(false)}>Cancel</button><button className="btn btn-primary" onClick={generateBulk} disabled={saving}>{saving ? 'Generating…' : 'Generate'}</button></>}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={generateBulk}>
          <div className="form-group">
            <label htmlFor="bulk-bill-month">Month <span className="required">*</span></label>
            <input id="bulk-bill-month" className="form-control" type="month" value={bulkMonth} onChange={e => setBulkMonth(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="bulk-bill-rate-mode">Rate Mode</label>
            <select id="bulk-bill-rate-mode" className="form-control" value={bulkMode} onChange={e => setBulkMode(e.target.value)}>
              <option value="per_sqft">Per Square Foot (₹{MAINTENANCE_RATE_PER_SQFT}/sqft)</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          {bulkMode === 'fixed' && (
            <div className="form-group">
              <label htmlFor="bulk-bill-fixed-amount">Fixed Amount (₹) <span className="required">*</span></label>
              <input id="bulk-bill-fixed-amount" className="form-control" type="number" inputMode="numeric" min="1" value={bulkFixedAmount} onChange={e => setBulkFixedAmount(e.target.value)} placeholder="e.g. 5000" />
            </div>
          )}
          <div className="form-hint" style={{ marginTop: 8 }}>
            Bills will be generated for {flats.length} flats. Existing bills for the selected month will be skipped. Previous pending dues will be carried forward.
          </div>
          <button type="submit" hidden />
        </form>
      </Modal>
    </div>
  );
}
