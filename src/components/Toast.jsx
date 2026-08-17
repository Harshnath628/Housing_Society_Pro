import { useEffect, useState } from 'react';

let toastId = 0;
const listeners = new Set();

export function showToast(message, type = 'success', duration = 3000) {
  const id = ++toastId;
  listeners.forEach(fn => fn({ id, message, type, duration }));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, toast.duration);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div role="status" aria-live="polite" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          style={{ cursor: 'pointer', animationDuration: `0.35s, 0.3s`, animationDelay: `0s, ${t.duration - 300}ms` }}
          onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
        >
          {t.type === 'success' ? '✓' : '!'} {t.message}
        </div>
      ))}
    </div>
  );
}
