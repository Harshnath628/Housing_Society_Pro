export default function ResidentPortal({ flat, resident, bills = [], payments = [], onLogout }) {
  if (!flat) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Could not load flat data.</p>
          <button className="btn btn-primary" onClick={onLogout}>Back to Login</button>
        </div>
      </div>
    );
  }

  const fmt = n => '₹' + n.toLocaleString('en-IN');
  const flatBills = bills.filter(b => b.flatId === flat.id).sort((a, b) => b.month.localeCompare(a.month));
  const flatPayments = payments.filter(p => p.flatId === flat.id);
  const totalBilled = flatBills.reduce((s, b) => s + b.totalDue, 0);
  const totalPaid = flatPayments.reduce((s, p) => s + p.amount, 0);
  const outstanding = totalBilled - totalPaid;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <div className="resident-header">
        <h1>Society<span style={{ color: 'var(--accent)' }}>Pro</span> <span style={{ color: 'var(--sidebar-text-active, #f5edd9)', fontWeight: 400, fontSize: 16 }}>Resident Portal</span></h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--sidebar-text-active, #f5edd9)' }}>{flat.flatNumber} · {resident?.name || 'Resident'}</span>
          <button className="btn btn-outline btn-sm" style={{ color: 'var(--sidebar-text-active, #f5edd9)', borderColor: 'rgba(245,237,217,0.3)' }} onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="resident-content">
        <div className="resident-info-card stagger-in">
          <div className="resident-info-item">
            <label>Flat</label>
            <p>{flat.flatNumber}</p>
          </div>
          <div className="resident-info-item">
            <label>Type</label>
            <p>{flat.type}</p>
          </div>
          <div className="resident-info-item">
            <label>Area</label>
            <p>{flat.area ? `${flat.area} sqft` : '—'}</p>
          </div>
          <div className="resident-info-item">
            <label>Outstanding</label>
            <p style={{ color: outstanding > 0 ? 'var(--rose)' : 'var(--emerald)' }}>{fmt(outstanding)}</p>
          </div>
        </div>

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: 'Total Billed', value: fmt(totalBilled), cls: '' },
            { label: 'Total Paid', value: fmt(totalPaid), cls: 'success' },
            { label: 'Pending', value: fmt(outstanding), cls: 'danger' },
          ].map((kpi, i) => (
            <div className={`kpi-card ${kpi.cls} stagger-in`} key={i} style={{ animationDelay: `${(i + 1) * 60}ms` }}>
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-value">{kpi.value}</div>
            </div>
          ))}
        </div>

        <div className="card stagger-in" style={{ marginBottom: 20, animationDelay: '250ms' }}>
          <div className="card-header"><h3>Maintenance Bills</h3></div>
          <div className="card-body table-wrap">
            <table>
              <thead><tr><th>Month</th><th>Amount</th><th>Pending Dues</th><th>Total Due</th><th>Status</th></tr></thead>
              <tbody>
                {flatBills.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.month}</td>
                    <td>{fmt(b.amount)}</td>
                    <td>{b.pendingDues > 0 ? <span style={{ color: 'var(--rose)' }}>{fmt(b.pendingDues)}</span> : '—'}</td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>{fmt(b.totalDue)}</td>
                    <td><span className={`badge ${b.status === 'Paid' ? 'badge-success' : b.status === 'Partial' ? 'badge-warning' : 'badge-danger'}`}>{b.status}</span></td>
                  </tr>
                ))}
                {flatBills.length === 0 && <tr><td colSpan={5} className="text-center" style={{ padding: 28, color: 'var(--text-muted)' }}>No bills</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card stagger-in" style={{ animationDelay: '300ms' }}>
          <div className="card-header"><h3>Payment History</h3></div>
          <div className="card-body table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Amount</th><th>Mode</th><th>Reference</th><th>Bill Month</th></tr></thead>
              <tbody>
                {[...flatPayments].sort((a, b) => b.date.localeCompare(a.date)).map(p => {
                  const bill = bills.find(b => b.id === p.billId);
                  return (
                    <tr key={p.id}>
                      <td>{p.date}</td>
                      <td style={{ color: 'var(--emerald)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{fmt(p.amount)}</td>
                      <td><span className="badge badge-primary">{p.mode}</span></td>
                      <td><span className="font-mono" style={{ fontSize: 12 }}>{p.reference}</span></td>
                      <td>{bill?.month || '—'}</td>
                    </tr>
                  );
                })}
                {flatPayments.length === 0 && <tr><td colSpan={5} className="text-center" style={{ padding: 28, color: 'var(--text-muted)' }}>No payments</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
