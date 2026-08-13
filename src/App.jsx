import { useState, useEffect, lazy, Suspense } from 'react';
import { LayoutGrid, Building2, Users, Receipt, CreditCard, Wallet, Bell, BarChart3, LogOut, Menu } from 'lucide-react';
import { initialBuildings, initialFlats, initialResidents, initialBills, initialPayments, initialExpenses, initialNotices } from './data/mockData';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Buildings = lazy(() => import('./pages/Buildings'));
const FlatsResidents = lazy(() => import('./pages/FlatsResidents'));
const Billing = lazy(() => import('./pages/Billing'));
const Payments = lazy(() => import('./pages/Payments'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Notices = lazy(() => import('./pages/Notices'));
const Reports = lazy(() => import('./pages/Reports'));
const ResidentPortal = lazy(() => import('./pages/ResidentPortal'));

function PageLoading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
      Loading…
    </div>
  );
}

const ICON_PROPS = { size: 18, strokeWidth: 1.5 };

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutGrid {...ICON_PROPS} /> },
  { key: 'buildings', label: 'Buildings', icon: <Building2 {...ICON_PROPS} /> },
  { key: 'flats', label: 'Flats & Residents', icon: <Users {...ICON_PROPS} /> },
  { key: 'billing', label: 'Billing', icon: <Receipt {...ICON_PROPS} /> },
  { key: 'payments', label: 'Payments', icon: <CreditCard {...ICON_PROPS} /> },
  { key: 'expenses', label: 'Expenses', icon: <Wallet {...ICON_PROPS} /> },
  { key: 'notices', label: 'Notices', icon: <Bell {...ICON_PROPS} /> },
  { key: 'reports', label: 'Reports', icon: <BarChart3 {...ICON_PROPS} /> },
];

function LoginPage({ onLogin }) {
  const [tab, setTab] = useState('admin');
  const [password, setPassword] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (tab === 'admin') {
      if (password === 'admin123') {
        onLogin({ role: 'admin' });
      } else {
        setError('Invalid password. Try: admin123');
      }
    } else {
      onLogin({ role: 'resident', flatNumber: flatNumber.toUpperCase() });
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(12px)', transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)' }}>
        <h1>Society<span style={{ color: 'var(--accent)' }}>Pro</span></h1>
        <p className="subtitle">Society Maintenance Management System</p>
        <div className="login-tabs">
          <button className={`login-tab ${tab === 'admin' ? 'active' : ''}`} onClick={() => { setTab('admin'); setError(''); }}>Admin</button>
          <button className={`login-tab ${tab === 'resident' ? 'active' : ''}`} onClick={() => { setTab('resident'); setError(''); }}>Resident</button>
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={handleLogin}>
          {tab === 'admin' ? (
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password" autoFocus />
            </div>
          ) : (
            <div className="form-group">
              <label>Flat Number</label>
              <input className="form-control" value={flatNumber} onChange={e => setFlatNumber(e.target.value)} placeholder="e.g. A-101, B-101, C-101" autoFocus />
            </div>
          )}
          <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: '12px 18px', fontSize: 14, fontWeight: 600 }}>
            Sign In
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
          {tab === 'admin' ? 'Demo password: admin123' : 'Try: A-101, B-101, C-101'}
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageKey, setPageKey] = useState(0);

  const [buildings, setBuildings] = useState(initialBuildings);
  const [flats, setFlats] = useState(initialFlats);
  const [residents, setResidents] = useState(initialResidents);
  const [bills, setBills] = useState(initialBills);
  const [payments, setPayments] = useState(initialPayments);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [notices, setNotices] = useState(initialNotices);

  const changePage = (p) => {
    setPage(p);
    setPageKey(k => k + 1);
    setSidebarOpen(false);
  };

  if (!user) return <LoginPage onLogin={setUser} />;

  if (user.role === 'resident') {
    const flat = flats.find(f => f.flatNumber === user.flatNumber);
    if (!flat) return (
      <div className="login-page">
        <div className="login-card">
          <h1 style={{ fontSize: 22 }}>Flat Not Found</h1>
          <p className="subtitle">No flat registered with number "{user.flatNumber}"</p>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={() => setUser(null)}>Back to Login</button>
        </div>
      </div>
    );
    const resident = residents.find(r => r.flatId === flat.id);
    return (
      <Suspense fallback={<PageLoading />}>
        <ResidentPortal flat={flat} resident={resident} bills={bills} payments={payments} onLogout={() => setUser(null)} />
      </Suspense>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard buildings={buildings} flats={flats} bills={bills} payments={payments} expenses={expenses} />;
      case 'buildings': return <Buildings buildings={buildings} setBuildings={setBuildings} flats={flats} />;
      case 'flats': return <FlatsResidents buildings={buildings} flats={flats} setFlats={setFlats} residents={residents} setResidents={setResidents} bills={bills} payments={payments} />;
      case 'billing': return <Billing buildings={buildings} flats={flats} bills={bills} setBills={setBills} payments={payments} />;
      case 'payments': return <Payments flats={flats} bills={bills} setBills={setBills} payments={payments} setPayments={setPayments} />;
      case 'expenses': return <Expenses expenses={expenses} setExpenses={setExpenses} />;
      case 'notices': return <Notices notices={notices} setNotices={setNotices} />;
      case 'reports': return <Reports bills={bills} payments={payments} expenses={expenses} />;
      default: return <Dashboard buildings={buildings} flats={flats} bills={bills} payments={payments} expenses={expenses} />;
    }
  };

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>Society<span className="logo-accent">Pro</span></h1>
          <p>Maintenance Management</p>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.key} className={`nav-item ${page === item.key ? 'active' : ''}`} onClick={() => changePage(item.key)}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => setUser(null)}>
            <LogOut size={18} strokeWidth={1.5} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} style={{ marginBottom: 16 }}>
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <div className="page-enter" key={pageKey}>
          <Suspense fallback={<PageLoading />}>
            {renderPage()}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
