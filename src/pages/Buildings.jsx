import { useState } from 'react';
import Modal from '../components/Modal';
import { createBuilding, updateBuilding, deleteBuilding as deleteBuildingApi } from '../lib/api';

export default function Buildings({ societyId, buildings, setBuildings, flats }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editBuilding, setEditBuilding] = useState(null);
  const [form, setForm] = useState({ name: '', floors: '', totalFlats: '', yearBuilt: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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

  const save = async () => {
    const missing = [];
    if (!form.name) missing.push('Building Name');
    if (!form.floors) missing.push('Floors');
    if (!form.totalFlats) missing.push('Total Flats');
    if (missing.length) {
      setError(`Enter ${missing.join(', ')} to continue.`);
      return;
    }
    setError('');
    setSaving(true);
    try {
      const payload = { name: form.name, floors: +form.floors, totalFlats: +form.totalFlats, yearBuilt: +form.yearBuilt || new Date().getFullYear() };
      if (editBuilding) {
        const updated = await updateBuilding(editBuilding.id, payload);
        setBuildings(prev => prev.map(b => b.id === editBuilding.id ? updated : b));
      } else {
        const created = await createBuilding(societyId, payload);
        setBuildings(prev => [...prev, created]);
      }
      setShowAdd(false);
    } catch (err) {
      setError(err.message || 'Could not save building.');
    } finally {
      setSaving(false);
    }
  };

  const deleteBuilding = async (b) => {
    const hasFlats = flats.some(f => f.buildingId === b.id);
    if (hasFlats) {
      alert(`Cannot delete "${b.name}" — it has registered flats. Remove them first.`);
      return;
    }
    if (confirm(`Delete building "${b.name}"?`)) {
      try {
        await deleteBuildingApi(b.id);
        setBuildings(prev => prev.filter(x => x.id !== b.id));
      } catch (err) {
        alert(err.message || 'Could not delete building.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Buildings</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Building</button>
      </div>

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
                <button className="btn btn-danger btn-sm" onClick={() => deleteBuilding(b)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal show={showAdd} onClose={() => setShowAdd(false)} title={editBuilding ? 'Edit Building' : 'Add Building'}
        footer={<><button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-group">
          <label htmlFor="building-name">Building Name</label>
          <input id="building-name" className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tower D" autoFocus />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="building-floors">Floors</label>
            <input id="building-floors" className="form-control" type="number" value={form.floors} onChange={e => setForm({ ...form, floors: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="building-total-flats">Total Flats</label>
            <input id="building-total-flats" className="form-control" type="number" value={form.totalFlats} onChange={e => setForm({ ...form, totalFlats: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="building-year-built">Year Built</label>
          <input id="building-year-built" className="form-control" type="number" value={form.yearBuilt} onChange={e => setForm({ ...form, yearBuilt: e.target.value })} placeholder="2024" />
        </div>
      </Modal>
    </div>
  );
}
