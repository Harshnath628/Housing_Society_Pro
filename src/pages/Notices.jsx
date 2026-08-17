import { useState } from 'react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showToast } from '../components/Toast';
import { createNotice, deleteNotice as deleteNoticeApi } from '../lib/api';

export default function Notices({ societyId, notices, setNotices }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'Normal' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => {
    setError('');
    setForm({ title: '', content: '', priority: 'Normal' });
    setShowAdd(true);
  };

  const addNotice = async (e) => {
    e?.preventDefault?.();
    const missing = [];
    if (!form.title.trim()) missing.push('Title');
    if (!form.content.trim()) missing.push('Content');
    if (missing.length) {
      setError(`Enter ${missing.join(' and ')} to continue.`);
      return;
    }
    setError('');
    setSaving(true);
    try {
      const created = await createNotice(societyId, form);
      setNotices(prev => [created, ...prev]);
      setShowAdd(false);
      showToast('Notice posted');
    } catch (err) {
      setError(err.message || 'Could not post notice.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteNoticeApi(confirmDelete.id);
      setNotices(prev => prev.filter(n => n.id !== confirmDelete.id));
      showToast('Notice deleted');
      setConfirmDelete(null);
    } catch (err) {
      showToast(err.message || 'Could not delete notice.', 'error');
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Notices</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Post Notice</button>
      </div>

      <div className="notice-list">
        {notices.map(n => (
          <div className={`notice-card ${(n.priority || 'normal').toLowerCase()}`} key={n.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4>{n.title}</h4>
                <div className="notice-meta">
                  <span>{n.date || '—'}</span>
                  <span>By {n.author || 'Admin'}</span>
                  <span className={`badge ${n.priority === 'High' ? 'badge-danger' : n.priority === 'Normal' ? 'badge-warning' : 'badge-success'}`}>{n.priority || 'Normal'}</span>
                </div>
              </div>
              <button className="btn btn-xs btn-danger" onClick={() => setConfirmDelete(n)}>Delete</button>
            </div>
            <p>{n.content}</p>
          </div>
        ))}
        {notices.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No notices posted</p>}
      </div>

      <Modal show={showAdd} onClose={() => setShowAdd(false)} title="Post Notice"
        footer={<><button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={addNotice} disabled={saving}>{saving ? 'Posting…' : 'Post'}</button></>}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={addNotice}>
          <div className="form-group">
            <label htmlFor="notice-title">Title <span className="required">*</span></label>
            <input id="notice-title" className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Water tank cleaning schedule" autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="notice-content">Content <span className="required">*</span></label>
            <textarea id="notice-content" className="form-control" rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write the notice details here…" />
          </div>
          <div className="form-group">
            <label htmlFor="notice-priority">Priority</label>
            <select id="notice-priority" className="form-control" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option>High</option><option>Normal</option><option>Low</option>
            </select>
          </div>
          <button type="submit" hidden />
        </form>
      </Modal>

      <ConfirmDialog
        show={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Notice"
        subject={confirmDelete?.title}
        message="This notice will be permanently removed."
        confirmLabel="Delete"
        busy={deleting}
      />
    </div>
  );
}
