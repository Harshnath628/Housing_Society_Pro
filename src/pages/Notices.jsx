import { useState } from 'react';
import Modal from '../components/Modal';
import { createNotice, deleteNotice as deleteNoticeApi } from '../lib/api';

export default function Notices({ societyId, notices, setNotices }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'Normal' });
  const [error, setError] = useState('');

  const addNotice = async () => {
    const missing = [];
    if (!form.title) missing.push('Title');
    if (!form.content) missing.push('Content');
    if (missing.length) {
      setError(`Enter ${missing.join(' and ')} to continue.`);
      return;
    }
    setError('');
    try {
      const created = await createNotice(societyId, form);
      setNotices(prev => [created, ...prev]);
      setShowAdd(false);
      setForm({ title: '', content: '', priority: 'Normal' });
    } catch (err) {
      setError(err.message || 'Could not post notice.');
    }
  };

  const deleteNotice = async (id) => {
    if (confirm('Delete this notice?')) {
      try {
        await deleteNoticeApi(id);
        setNotices(prev => prev.filter(n => n.id !== id));
      } catch (err) {
        alert(err.message || 'Could not delete notice.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Notices</h2>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowAdd(true); }}>+ Post Notice</button>
      </div>

      <div className="notice-list">
        {notices.map(n => (
          <div className={`notice-card ${n.priority.toLowerCase()}`} key={n.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4>{n.title}</h4>
                <div className="notice-meta">
                  <span>{n.date}</span>
                  <span>By {n.author}</span>
                  <span className={`badge ${n.priority === 'High' ? 'badge-danger' : n.priority === 'Normal' ? 'badge-warning' : 'badge-success'}`}>{n.priority}</span>
                </div>
              </div>
              <button className="btn btn-xs btn-danger" onClick={() => deleteNotice(n.id)}>Delete</button>
            </div>
            <p>{n.content}</p>
          </div>
        ))}
        {notices.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No notices posted</p>}
      </div>

      <Modal show={showAdd} onClose={() => setShowAdd(false)} title="Post Notice"
        footer={<><button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={addNotice}>Post</button></>}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-group">
          <label>Title</label>
          <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea className="form-control" rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select className="form-control" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option>High</option><option>Normal</option><option>Low</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
