import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page, #f5edd9)', padding: 32 }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Yeseva One', serif", color: 'var(--accent, #9b3420)', marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary, #666)', fontSize: 14, marginBottom: 20 }}>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            className="btn btn-primary"
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{ padding: '10px 24px' }}
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }
}
