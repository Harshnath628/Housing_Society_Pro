import { useState } from 'react';
import Modal from '../components/Modal';
import { createPayment, updateBillStatus } from '../lib/api';

export default function Payments({ societyId, flats, bills, setBills, payments, setPayments }) {
  const [showRecord, setShowRecord] = useState(false);
  const [form, setForm] = useState({ flatId: '', billId: '', amount: '', mode: 'UPI', reference: '', date: '' });
  const [error, setError] = useState('');

  const fmt = n => '₹' + n.toLocaleString('en-IN');

  const pendingBills = bills.filter(b => b.status !== 'Paid');
  const selectedFlatBills = form.flatId ? pendingBills.filter(b => b.flatId === +form.flatId) : [];

  const recordPayment = async () => {
    const missing = [];
    if (!form.flatId) missing.push('Flat');
    if (!form.billId) missing.push('Bill');
    if (!form.amount) missing.push('Amount');
    if (!form.date) missing.push('Date');
    if (missing.length) {
      setError(`Select ${missing.join(', ')} to continue.`);
      return;
    }
    const bill = bills.find(b => b.id === +form.billId);
    if (!bill) {
      setError('The selected bill could not be found. Please choose the bill again.');
      return;
    }
    setError('');

    try {
      const created = await createPayment(societyId, {
        billId: +form.billId,
        flatId: +form.flatId,
        amount: +form.amount,
        mode: form.mode,
        reference: form.reference || `${form.mode.toUpperCase()}-${Date.now()}`,
        date: form.date,
        receivedBy: 'Admin'
      });
      setPayments(prev => [...prev, created]);

      const totalPaid = payments.filter(p => p.billId === bill.id).reduce((s, p) => s + p.amount, 0) + +form.amount;
      const newStatus = totalPaid >= bill.totalDue ? 'Paid' : 'Partial';
      const updatedBill = await updateBillStatus(bill.id, newStatus);
      setBills(prev => prev.map(b => b.id === bill.id ? updatedBill : b));

      setShowRecord(false);
      setForm({ flatId: '', billId: '', amount: '', mode: 'UPI', reference: '', date: '' });
    } catch (err) {
      setError(err.message || 'Could not record payment.');
    }
  };

  const sorted = [...payments].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="page-header">
        <h2>Payments</h2>
        <button className="btn btn-success" onClick={() => { setError(''); setShowRecord(true); }}>+ Record Payment</button>
      </div>

      <div className="card">
        <div className="card-body table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Flat</th><th>Amount</th><th>Mode</th><th>Reference</th><th>Bill Month</th></tr>
            </thead>
            <tbody>
              {sorted.map(p => {
                const flat = flats.find(f => f.id === p.flatId);
                const bill = bills.find(b => b.id === p.billId);
                return (
                  <tr key={p.id}>
                    <td>{p.date}</td>
                    <td><span className="font-mono" style={{ fontWeight: 600 }}>{flat?.flatNumber || '—'}</span></td>
                    <td style={{ color: 'var(--emerald)', fontWeight: 600 }}>{fmt(p.amount)}</td>
                    <td><span className="badge badge-primary">{p.mode}</span></td>
                    <td><span className="font-mono" style={{ fontSize: 12 }}>{p.reference}</span></td>
                    <td>{bill?.month || '—'}</td>
                  </tr>
                );
              })}
              {payments.length === 0 && <tr><td colSpan={6} className="text-center" style={{ padding: 20, color: 'var(--text-muted)' }}>No payments recorded</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showRecord} onClose={() => setShowRecord(false)} title="Record Payment"
        footer={<><button className="btn btn-outline" onClick={() => setShowRecord(false)}>Cancel</button><button className="btn btn-success" onClick={recordPayment}>Record</button></>}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-group">
          <label>Flat</label>
          <select className="form-control" value={form.flatId} onChange={e => setForm({ ...form, flatId: e.target.value, billId: '' })}>
            <option value="">Select Flat</option>
            {flats.map(f => <option key={f.id} value={f.id}>{f.flatNumber}</option>)}
          </select>
        </div>
        {form.flatId && (
          <div className="form-group">
            <label>Pending Bill</label>
            <select className="form-control" value={form.billId} onChange={e => {
              const bill = bills.find(b => b.id === +e.target.value);
              const paid = bill ? payments.filter(p => p.billId === bill.id).reduce((s, p) => s + p.amount, 0) : 0;
              setForm({ ...form, billId: e.target.value, amount: bill ? (bill.totalDue - paid).toString() : '' });
            }}>
              <option value="">Select Bill</option>
              {selectedFlatBills.map(b => {
                const paid = payments.filter(p => p.billId === b.id).reduce((s, p) => s + p.amount, 0);
                return <option key={b.id} value={b.id}>{b.month} — Due: {fmt(b.totalDue - paid)}</option>;
              })}
            </select>
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label>Amount (₹)</label>
            <input className="form-control" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Mode</label>
            <select className="form-control" value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
              <option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Cheque</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Reference</label>
            <input className="form-control" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="Optional" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input className="form-control" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
