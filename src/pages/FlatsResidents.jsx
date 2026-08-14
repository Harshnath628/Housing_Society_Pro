import { useState } from 'react';
import Modal from '../components/Modal';
import { createFlat, createResident, updateResident as updateResidentApi, updateFlatOwner } from '../lib/api';

export default function FlatsResidents({ societyId, buildings, flats, setFlats, residents, setResidents, bills, payments }) {
  const [filterBuilding, setFilterBuilding] = useState('all');
  const [showAddFlat, setShowAddFlat] = useState(false);
  const [showAddResident, setShowAddResident] = useState(false);
  const [showEditResident, setShowEditResident] = useState(null);
  const [showStatement, setShowStatement] = useState(null);
  const [showEditOwner, setShowEditOwner] = useState(null);
  const [selectedFlat, setSelectedFlat] = useState(null);

  const [flatForm, setFlatForm] = useState({ buildingId: '', flatNumber: '', floor: '', type: '2BHK', area: '', ownerName: '', ownerMobile: '' });
  const [flatError, setFlatError] = useState('');
  const [residentForm, setResidentForm] = useState({ name: '', phone: '', email: '', type: 'Owner', moveInDate: '' });
  const [residentError, setResidentError] = useState('');
  const [ownerForm, setOwnerForm] = useState({ ownerName: '', ownerMobile: '' });

  const filtered = filterBuilding === 'all' ? flats : flats.filter(f => f.buildingId === +filterBuilding);
  const fmt = n => '₹' + n.toLocaleString('en-IN');

  const addFlat = async () => {
    const missing = [];
    if (!flatForm.buildingId) missing.push('Building');
    if (!flatForm.flatNumber) missing.push('Flat Number');
    if (!flatForm.floor) missing.push('Floor');
    if (missing.length) {
      setFlatError(`Enter ${missing.join(', ')} to continue.`);
      return;
    }
    setFlatError('');
    try {
      const created = await createFlat(societyId, {
        buildingId: +flatForm.buildingId, flatNumber: flatForm.flatNumber,
        floor: +flatForm.floor, type: flatForm.type, area: +flatForm.area || 0,
        ownerName: flatForm.ownerName, ownerMobile: flatForm.ownerMobile
      });
      setFlats(prev => [...prev, created]);
      setShowAddFlat(false);
      setFlatForm({ buildingId: '', flatNumber: '', floor: '', type: '2BHK', area: '', ownerName: '', ownerMobile: '' });
    } catch (err) {
      setFlatError(err.message || 'Could not add flat.');
    }
  };

  const validateResidentForm = () => {
    const missing = [];
    if (!residentForm.name) missing.push('Name');
    if (!residentForm.phone) missing.push('Phone');
    if (missing.length) {
      setResidentError(`Enter ${missing.join(' and ')} to continue.`);
      return false;
    }
    setResidentError('');
    return true;
  };

  const addResident = async () => {
    if (!validateResidentForm()) return;
    try {
      const created = await createResident(societyId, selectedFlat.id, residentForm);
      setResidents(prev => [...prev, created]);
      setShowAddResident(false);
    } catch (err) {
      setResidentError(err.message || 'Could not add resident.');
    }
  };

  const saveEditResident = async () => {
    if (!validateResidentForm()) return;
    try {
      const updated = await updateResidentApi(showEditResident.id, residentForm);
      setResidents(prev => prev.map(r => r.id === showEditResident.id ? updated : r));
      setShowEditResident(null);
    } catch (err) {
      setResidentError(err.message || 'Could not save resident.');
    }
  };

  const openEditResident = (r) => {
    setResidentForm({ name: r.name, phone: r.phone, email: r.email, type: r.type, moveInDate: r.moveInDate });
    setResidentError('');
    setShowEditResident(r);
  };

  const openAddResident = (flat) => {
    setSelectedFlat(flat);
    setResidentForm({ name: '', phone: '', email: '', type: 'Owner', moveInDate: '' });
    setResidentError('');
    setShowAddResident(true);
  };

  const openEditOwner = (flat) => {
    setOwnerForm({ ownerName: flat.ownerName || '', ownerMobile: flat.ownerMobile || '' });
    setShowEditOwner(flat);
  };

  const saveOwner = async () => {
    try {
      const updated = await updateFlatOwner(showEditOwner.id, ownerForm.ownerName, ownerForm.ownerMobile);
      setFlats(prev => prev.map(f => f.id === showEditOwner.id ? updated : f));
      setShowEditOwner(null);
    } catch (err) {
      alert(err.message || 'Could not save owner details.');
    }
  };

  const getStatementData = (flat) => {
    const flatBills = bills.filter(b => b.flatId === flat.id).sort((a, b) => a.month.localeCompare(b.month));
    const flatPayments = payments.filter(p => p.flatId === flat.id);
    const totalBilled = flatBills.reduce((s, b) => s + b.totalDue, 0);
    const totalPaid = flatPayments.reduce((s, p) => s + p.amount, 0);
    return { flatBills, flatPayments, totalBilled, totalPaid, outstanding: totalBilled - totalPaid };
  };

  return (
    <div>
      <div className="page-header">
        <h2>Flats & Residents</h2>
        <button className="btn btn-primary" onClick={() => { setFlatError(''); setShowAddFlat(true); }}>+ Add Flat</button>
      </div>

      <div className="filter-bar">
        <select value={filterBuilding} onChange={e => setFilterBuilding(e.target.value)} aria-label="Filter by building">
          <option value="all">All Buildings</option>
          {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{filtered.length} flats</span>
      </div>

      <div className="card">
        <div className="card-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Flat</th>
                <th>Building</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Area (sqft)</th>
                <th>Owner Details</th>
                <th>Resident</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const building = buildings.find(b => b.id === f.buildingId);
                const resident = residents.find(r => r.flatId === f.id);
                return (
                  <tr key={f.id}>
                    <td><span className="font-mono" style={{ fontWeight: 600 }}>{f.flatNumber}</span></td>
                    <td>{building?.name || '—'}</td>
                    <td>{f.floor}</td>
                    <td><span className="badge badge-primary">{f.type}</span></td>
                    <td>{f.area}</td>
                    <td>
                      {f.ownerName ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>{f.ownerName}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.ownerMobile}</div>
                          <button className="btn btn-xs btn-outline" style={{ marginTop: 4 }} onClick={() => openEditOwner(f)}>Edit</button>
                        </div>
                      ) : (
                        <button className="btn btn-xs btn-outline" onClick={() => openEditOwner(f)}>+ Add Owner</button>
                      )}
                    </td>
                    <td>
                      {resident ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>{resident.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{resident.type} · {resident.phone}</div>
                          <button className="btn btn-xs btn-outline" style={{ marginTop: 4 }} onClick={() => openEditResident(resident)}>Edit</button>
                        </div>
                      ) : (
                        <button className="btn btn-xs btn-success" onClick={() => openAddResident(f)}>+ Add Resident</button>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => setShowStatement(f)}>Statement</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Flat Modal */}
      <Modal show={showAddFlat} onClose={() => setShowAddFlat(false)} title="Add Flat"
        footer={<><button className="btn btn-outline" onClick={() => setShowAddFlat(false)}>Cancel</button><button className="btn btn-primary" onClick={addFlat}>Add Flat</button></>}>
        {flatError && <div className="form-error" role="alert">{flatError}</div>}
        <div className="form-group">
          <label htmlFor="flat-building">Building</label>
          <select id="flat-building" className="form-control" value={flatForm.buildingId} onChange={e => setFlatForm({ ...flatForm, buildingId: e.target.value })}>
            <option value="">Select Building</option>
            {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="flat-number">Flat Number</label>
            <input id="flat-number" className="form-control" value={flatForm.flatNumber} onChange={e => setFlatForm({ ...flatForm, flatNumber: e.target.value })} placeholder="e.g. D-301" />
          </div>
          <div className="form-group">
            <label htmlFor="flat-floor">Floor</label>
            <input id="flat-floor" className="form-control" type="number" value={flatForm.floor} onChange={e => setFlatForm({ ...flatForm, floor: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="flat-type">Type</label>
            <select id="flat-type" className="form-control" value={flatForm.type} onChange={e => setFlatForm({ ...flatForm, type: e.target.value })}>
              <option>1BHK</option><option>2BHK</option><option>3BHK</option><option>4BHK</option><option>Studio</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="flat-area">Area (sqft)</label>
            <input id="flat-area" className="form-control" type="number" value={flatForm.area} onChange={e => setFlatForm({ ...flatForm, area: e.target.value })} />
          </div>
        </div>
        <hr className="form-divider" />
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Owner Details (optional)</p>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="flat-owner-name">Owner Name</label>
            <input id="flat-owner-name" className="form-control" value={flatForm.ownerName} onChange={e => setFlatForm({ ...flatForm, ownerName: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="flat-owner-mobile">Owner Mobile</label>
            <input id="flat-owner-mobile" className="form-control" value={flatForm.ownerMobile} onChange={e => setFlatForm({ ...flatForm, ownerMobile: e.target.value })} placeholder="9876543210" />
          </div>
        </div>
      </Modal>

      {/* Add Resident Modal */}
      <Modal show={showAddResident} onClose={() => setShowAddResident(false)} title={`Add Resident — ${selectedFlat?.flatNumber}`}
        footer={<><button className="btn btn-outline" onClick={() => setShowAddResident(false)}>Cancel</button><button className="btn btn-primary" onClick={addResident}>Add</button></>}>
        {residentError && <div className="form-error" role="alert">{residentError}</div>}
        <div className="form-group">
          <label htmlFor="add-resident-name">Name</label>
          <input id="add-resident-name" className="form-control" value={residentForm.name} onChange={e => setResidentForm({ ...residentForm, name: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="add-resident-phone">Phone</label>
            <input id="add-resident-phone" className="form-control" value={residentForm.phone} onChange={e => setResidentForm({ ...residentForm, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="add-resident-email">Email</label>
            <input id="add-resident-email" className="form-control" value={residentForm.email} onChange={e => setResidentForm({ ...residentForm, email: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="add-resident-type">Type</label>
            <select id="add-resident-type" className="form-control" value={residentForm.type} onChange={e => setResidentForm({ ...residentForm, type: e.target.value })}>
              <option>Owner</option><option>Tenant</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="add-resident-movein">Move-in Date</label>
            <input id="add-resident-movein" className="form-control" type="date" value={residentForm.moveInDate} onChange={e => setResidentForm({ ...residentForm, moveInDate: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* Edit Resident Modal */}
      <Modal show={!!showEditResident} onClose={() => setShowEditResident(null)} title="Edit Resident"
        footer={<><button className="btn btn-outline" onClick={() => setShowEditResident(null)}>Cancel</button><button className="btn btn-primary" onClick={saveEditResident}>Save</button></>}>
        {residentError && <div className="form-error" role="alert">{residentError}</div>}
        <div className="form-group">
          <label htmlFor="edit-resident-name">Name</label>
          <input id="edit-resident-name" className="form-control" value={residentForm.name} onChange={e => setResidentForm({ ...residentForm, name: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edit-resident-phone">Phone</label>
            <input id="edit-resident-phone" className="form-control" value={residentForm.phone} onChange={e => setResidentForm({ ...residentForm, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="edit-resident-email">Email</label>
            <input id="edit-resident-email" className="form-control" value={residentForm.email} onChange={e => setResidentForm({ ...residentForm, email: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edit-resident-type">Type</label>
            <select id="edit-resident-type" className="form-control" value={residentForm.type} onChange={e => setResidentForm({ ...residentForm, type: e.target.value })}>
              <option>Owner</option><option>Tenant</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="edit-resident-movein">Move-in Date</label>
            <input id="edit-resident-movein" className="form-control" type="date" value={residentForm.moveInDate} onChange={e => setResidentForm({ ...residentForm, moveInDate: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* Edit Owner Modal */}
      <Modal show={!!showEditOwner} onClose={() => setShowEditOwner(null)} title={`Owner Details — ${showEditOwner?.flatNumber}`}
        footer={<><button className="btn btn-outline" onClick={() => setShowEditOwner(null)}>Cancel</button><button className="btn btn-primary" onClick={saveOwner}>Save</button></>}>
        <div className="form-group">
          <label htmlFor="edit-owner-name">Owner Name</label>
          <input id="edit-owner-name" className="form-control" value={ownerForm.ownerName} onChange={e => setOwnerForm({ ...ownerForm, ownerName: e.target.value })} />
        </div>
        <div className="form-group">
          <label htmlFor="edit-owner-mobile">Owner Mobile</label>
          <input id="edit-owner-mobile" className="form-control" value={ownerForm.ownerMobile} onChange={e => setOwnerForm({ ...ownerForm, ownerMobile: e.target.value })} placeholder="9876543210" />
        </div>
      </Modal>

      {/* Payment Statement Modal */}
      <Modal show={!!showStatement} onClose={() => setShowStatement(null)} title={`Payment Statement — ${showStatement?.flatNumber}`} large>
        {showStatement && (() => {
          const { flatBills, flatPayments, totalBilled, totalPaid, outstanding } = getStatementData(showStatement);
          const resident = residents.find(r => r.flatId === showStatement.id);
          return (
            <div>
              <div className="statement-summary">
                <div className="statement-summary-card billed">
                  <div className="label" style={{ color: 'var(--accent)' }}>Total Billed</div>
                  <div className="value" style={{ color: 'var(--accent)' }}>{fmt(totalBilled)}</div>
                </div>
                <div className="statement-summary-card paid">
                  <div className="label" style={{ color: 'var(--emerald)' }}>Total Paid</div>
                  <div className="value" style={{ color: 'var(--emerald)' }}>{fmt(totalPaid)}</div>
                </div>
                <div className="statement-summary-card outstanding">
                  <div className="label" style={{ color: 'var(--rose)' }}>Outstanding</div>
                  <div className="value" style={{ color: 'var(--rose)' }}>{fmt(outstanding)}</div>
                </div>
              </div>

              {resident && (
                <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Resident:</strong> {resident.name} ({resident.type}) · {resident.phone}
                  {showStatement.ownerName && <span> · <strong style={{ color: 'var(--text-primary)' }}>Owner:</strong> {showStatement.ownerName}</span>}
                </div>
              )}

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Month</th><th>Type</th><th>Amount</th><th>Pending Dues</th><th>Total Due</th><th>Status / Ref</th></tr>
                  </thead>
                  <tbody>
                    {flatBills.length === 0 && <tr><td colSpan={6} className="text-center" style={{ padding: 20, color: 'var(--text-muted)' }}>No bills generated</td></tr>}
                    {flatBills.map(bill => {
                      const billPayments = flatPayments.filter(p => p.billId === bill.id);
                      return (
                        <tbody key={bill.id}>
                          <tr className="statement-row-bill">
                            <td style={{ fontWeight: 600 }}>{bill.month}</td>
                            <td>Bill</td>
                            <td>{fmt(bill.amount)}</td>
                            <td>{bill.pendingDues > 0 ? fmt(bill.pendingDues) : '—'}</td>
                            <td style={{ fontWeight: 600 }}>{fmt(bill.totalDue)}</td>
                            <td>
                              <span className={`badge ${bill.status === 'Paid' ? 'badge-success' : bill.status === 'Partial' ? 'badge-warning' : 'badge-danger'}`}>{bill.status}</span>
                            </td>
                          </tr>
                          {billPayments.map(p => (
                            <tr key={p.id} className="statement-row-payment">
                              <td style={{ paddingLeft: 32 }}>{p.date}</td>
                              <td>Payment ({p.mode})</td>
                              <td style={{ color: 'var(--emerald)', fontWeight: 600 }}>{fmt(p.amount)}</td>
                              <td>—</td>
                              <td>—</td>
                              <td><span className="font-mono" style={{ fontSize: 12 }}>{p.reference}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
