import Modal from './Modal';

export default function ConfirmDialog({ show, onClose, onConfirm, title, message, subject, warning, confirmLabel = 'Confirm', confirmClass = 'btn-danger', busy = false }) {
  if (!show) return null;
  return (
    <Modal show={show} onClose={onClose} title={title}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={busy}>Cancel</button>
          <button className={`btn ${confirmClass}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </>
      }>
      <div className="confirm-body">
        {subject && <div className="confirm-subject">{subject}</div>}
        {message && <p>{message}</p>}
        {warning && <p className="confirm-warning">{warning}</p>}
      </div>
    </Modal>
  );
}
