import { useState } from 'react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showToast } from '../components/Toast';
import { createBuilding, updateBuilding, deleteBuilding as deleteBuildingApi } from '../lib/api';

export default function Buildings({ societyId, buildings, setBuildings, flats }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editBuilding, setEditBuilding] = useState(null);
  const [form, setForm] = useState({ name: '', floors: '', totalFlats: '', yearBuilt: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => {
    setForm({ name: '', floors: '', totalFlats: '', yearBuilt: '' });
    setEditBuilding(null);
    setError('');
    setShowAdd(true);
  };

  const openEdit = (b) => {
    setForm({ name: b.name, floors: b.floors.toString(), totalFlats: b.totalFlats.toString(), yearBuilt: b.yearBuilt.toString() });
    setEditBuilding(b);
    setError('');
    setShowAdd(true);
  };

  const save = async (e) => {
    e?.preventDefault?.();
    const missing = [];
    if (!form.name.trim()) missing.push('Building Name');
    if (!form.floors) missing.push('Floors');
    if (!form.totalFlats) missing.push('Total Flats');
    if (missing.length) {
      setError(`Enter ${missing.join(', ')} to continue.`);
      return;
    }
    setError('');
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), floors: +form.floors, totalFlats: +form.totalFlats, yearBuilt: +form.yearBuilt || new Date().getFullYear() };
      if (editBuilding) {
        const updated = await updateBuilding(editBuilding.id, payload);
        setBuildings(prev => prev.map(b => b.id === editBuilding.id ? updated : b));
        showToast(`"${payload.name}" updated`);
      } else {
        const created = await createBuilding(societyId, payload);
        setBuildings(prev => [...prev, created]);
        showToast(`"${payload.name}" added`);
      }
      setShowAdd(false);
    } catch (err) {
      setError(err.message || 'Could not save building.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteBuildingApi(confirmDelete.id);
      setBuildings(prev => prev.filter(x => x.id !== confirmDelete.id));
      showToast(`"${confirmDelete.name}" deleted`);
      setConfirmDelete(null);
    } catch (err) {
      showToast(err.message || 'Could not delete building.', 'error');
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const tryDelete = (b) => {
    const hasFlats = flats.some(f => f.buildingId === b.id);
    if (hasFlats) {
      showToast(`Cannot delete "${b.name}" — it has registered flats. Remove them first.`, 'error', 4000);
      return;
    }
    setConfirmDelete(b);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Buildings</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Building</button>
      </div>

      {buildings.length === 0 && (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>No buildings added yet. Start by adding your first building.</p>
            <button className="btn btn-primary" onClick={openAdd}>+ Add Building</button>
          </div>
        </div>
      )}

      <div className="building-grid">
        {buildings.map((b, i) => {
          const occupied = flats.filter(f => f.buildingId === b.id).length;
          return (
            <div className="building-card stagger-in" key={b.id} style={{ animationDelay: `${i * 60}ms` }}>
              <h4>{b.name}</h4>
              <div className="building-stat"><span>Floors</span><span>{b.floors}</span></div>
              <div className="building-stat"><span>Total Flats</span><span>{b.totalFlats}</span></div>
              <div className="building-stat"><span>Registered Flats</span><span>{occupied}</span></div>
              <div className="building-stat"><span>Year Built</span><span>{b.yearBuilt}</span></div>
              <div className="building-actions">
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(b)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => tryDelete(b)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal show={showAdd} onClose={() => setShowAdd(false)} title={editBuilding ? 'Edit Building' : 'Add Building'}
        footer={<><button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={save}>
          <div className="form-group">
            <label htmlFor="building-name">Building Name <span className="required">*</span></label>
            <input id="building-name" className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tower A, Block 2" autoFocus />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="building-floors">Floors <span className="required">*</span></label>
              <input id="building-floors" className="form-control" type="number" min="1" max="100" value={form.floors} onChange={e => setForm({ ...form, floors: e.target.value })} placeholder="e.g. 12" />
            </div>
            <div className="form-group">
              <label htmlFor="building-total-flats">Total Flats <span className="required">*</span></label>
              <input id="building-total-flats" className="form-control" type="number" min="1" max="1000" value={form.totalFlats} onChange={e => setForm({ ...form, totalFlats: e.target.value })} placeholder="e.g. 48" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="building-year-built">Year Built</label>
            <input id="building-year-built" className="form-control" type="number" min="1900" max="2030" value={form.yearBuilt} onChange={e => setForm({ ...form, yearBuilt: e.target.value })} placeholder={new Date().getFullYear().toString()} />
            <div className="form-hint">Defaults to current year if left empty.</div>
          </div>
          <button type="submit" hidden />
        </form>
      </Modal>

      <ConfirmDialog
        show={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Building"
        subject={confirmDelete?.name}
        message="This will permanently remove this building and cannot be undone."
        warning="Make sure all flats are removed first."
        confirmLabel="Delete"
        busy={deleting}
      />
    </div>
  );
}
