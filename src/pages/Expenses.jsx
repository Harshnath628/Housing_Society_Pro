import { useState } from 'react';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';
import { EXPENSE_CATEGORIES } from '../data/mockData';
import { createExpense } from '../lib/api';

export default function Expenses({ societyId, expenses, setExpenses }) {
  const today = new Date().toISOString().split('T')[0];
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'Security', description: '', amount: '', date: today, paidTo: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fmt = n => '₹' + n.toLocaleString('en-IN');

  const openAdd = () => {
    setError('');
    setForm({ category: 'Security', description: '', amount: '', date: today, paidTo: '' });
    setShowAdd(true);
  };

  const addExpense = async (e) => {
    e?.preventDefault?.();
    const missing = [];
    if (!form.description.trim()) missing.push('Description');
    if (!form.amount) missing.push('Amount');
    if (!form.date) missing.push('Date');
    if (missing.length) {
      setError(`Enter ${missing.join(', ')} to continue.`);
      return;
    }
    setError('');
    setSaving(true);
    try {
      const created = await createExpense(societyId, { ...form, amount: +form.amount });
      setExpenses(prev => [...prev, created]);
      setShowAdd(false);
      showToast(`Expense of ${fmt(+form.amount)} added`);
    } catch (err) {
      setError(err.message || 'Could not add expense.');
    } finally {
      setSaving(false);
    }
  };

  const totalByCategory = {};
  expenses.forEach(e => { totalByCategory[e.category] = (totalByCategory[e.category] || 0) + e.amount; });
  const maxCat = Math.max(...Object.values(totalByCategory), 1);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div className="page-header">
        <h2>Expenses</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Expense</button>
      </div>

      <div className="charts-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Category Breakdown</h3></div>
          <div className="card-body">
            {Object.entries(totalByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <div className="expense-bar-wrap" key={cat}>
                <div className="expense-bar-label">
                  <span>{cat}</span>
                  <span>{fmt(amt)} ({((amt / totalExpenses) * 100).toFixed(0)}%)</span>
                </div>
                <div className="expense-bar-track">
                  <div className="expense-bar-fill" style={{ transform: `scaleX(${amt / maxCat})` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Summary</h3></div>
          <div className="card-body">
            <div className="kpi-card danger" style={{ marginBottom: 12 }}>
              <div className="kpi-label">Total Expenses</div>
              <div className="kpi-value">{fmt(totalExpenses)}</div>
              <div className="kpi-sub">{expenses.length} transactions</div>
            </div>
            <div className="kpi-card" style={{ marginBottom: 0 }}>
              <div className="kpi-label">Categories</div>
              <div className="kpi-value">{Object.keys(totalByCategory).length}</div>
              <div className="kpi-sub">Top: {Object.entries(totalByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>All Expenses</h3></div>
        <div className="card-body table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Paid To</th><th>Amount</th></tr></thead>
            <tbody>
              {expenses.length === 0 && <tr><td colSpan={5} className="text-center" style={{ padding: 20, color: 'var(--text-muted)' }}>No expenses recorded</td></tr>}
              {[...expenses].sort((a, b) => b.date.localeCompare(a.date)).map(e => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td><span className="badge badge-primary">{e.category}</span></td>
                  <td>{e.description}</td>
                  <td>{e.paidTo}</td>
                  <td style={{ fontWeight: 600 }}>{fmt(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showAdd} onClose={() => setShowAdd(false)} title="Add Expense"
        footer={<><button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={addExpense} disabled={saving}>{saving ? 'Adding…' : 'Add'}</button></>}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={addExpense}>
          <div className="form-group">
            <label htmlFor="expense-category">Category</label>
            <select id="expense-category" className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} autoFocus>
              {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="expense-description">Description <span className="required">*</span></label>
            <input id="expense-description" className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Monthly security guard salary" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expense-amount">Amount (₹) <span className="required">*</span></label>
              <input id="expense-amount" className="form-control" type="number" inputMode="numeric" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 15000" />
            </div>
            <div className="form-group">
              <label htmlFor="expense-date">Date <span className="required">*</span></label>
              <input id="expense-date" className="form-control" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="expense-paid-to">Paid To</label>
            <input id="expense-paid-to" className="form-control" value={form.paidTo} onChange={e => setForm({ ...form, paidTo: e.target.value })} placeholder="e.g. ABC Security Services" />
          </div>
          <button type="submit" hidden />
        </form>
      </Modal>
    </div>
  );
}
