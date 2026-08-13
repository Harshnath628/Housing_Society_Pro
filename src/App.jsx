import { useState, useEffect, lazy, Suspense } from 'react';
import { LayoutGrid, Building2, Users, Receipt, CreditCard, Wallet, Bell, BarChart3, LogOut, Menu } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { signInAdmin, signUpAdmin, signOut, getMyProfile, createSociety, getResidentPortal, fetchAllData } from './lib/api';

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

function LoginPage({ onAdminSignIn, onAdminSignUp, onResidentLogin }) {
  const [tab, setTab] = useState('admin');
  const [adminMode, setAdminMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (tab === 'admin') {
        if (adminMode === 'signin') {
          await onAdminSignIn(email, password);
        } else {
          await onAdminSignUp(email, password);
        }
      } else {
        const found = await onResidentLogin(flatNumber.toUpperCase());
        if (!found) setError(`No flat registered with number "${flatNumber.toUpperCase()}"`);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
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
            <>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@society.example" autoFocus />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={adminMode === 'signin' ? 'Enter admin password' : 'Choose a password (min 6 chars)'} />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>Flat Number</label>
              <input className="form-control" value={flatNumber} onChange={e => setFlatNumber(e.target.value)} placeholder="e.g. A-101" autoFocus />
            </div>
          )}
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', padding: '12px 18px', fontSize: 14, fontWeight: 600 }}>
            {busy ? 'Please wait…' : tab === 'admin' ? (adminMode === 'signin' ? 'Sign In' : 'Create Account') : 'Sign In'}
          </button>
        </form>
        {tab === 'admin' && (
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12 }}>
            {adminMode === 'signin' ? (
              <>New society? <button type="button" className="link-btn" onClick={() => { setAdminMode('signup'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Create an account</button></>
            ) : (
              <>Already set up? <button type="button" className="link-btn" onClick={() => { setAdminMode('signin'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Sign in</button></>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function SetupSociety({ onCreate }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Enter your society name to continue.'); return; }
    setError('');
    setBusy(true);
    try {
      await onCreate(name.trim());
    } catch (err) {
      setError(err.message || 'Could not create your society.');
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 style={{ fontSize: 22 }}>Set Up Your Society</h1>
        <p className="subtitle">You're signed in — now name the society you're managing.</p>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Society Name</label>
            <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Green Valley Residency" autoFocus />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', padding: '12px 18px', fontSize: 14, fontWeight: 600 }}>
            {busy ? 'Creating…' : 'Create Society'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [authPhase, setAuthPhase] = useState('checking'); // checking | login | setup | admin | resident
  const [profile, setProfile] = useState(null);
  const [residentPortal, setResidentPortal] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageKey, setPageKey] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);

  const [buildings, setBuildings] = useState([]);
  const [flats, setFlats] = useState([]);
  const [residents, setResidents] = useState([]);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [notices, setNotices] = useState([]);

  const loadAdminData = async () => {
    setDataLoading(true);
    try {
      const data = await fetchAllData();
      setBuildings(data.buildings);
      setFlats(data.flats);
      setResidents(data.residents);
      setBills(data.bills);
      setPayments(data.payments);
      setExpenses(data.expenses);
      setNotices(data.notices);
    } finally {
      setDataLoading(false);
    }
  };

  const resolveSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setAuthPhase('login');
      return;
    }
    const myProfile = await getMyProfile();
    if (!myProfile) {
      setAuthPhase('setup');
      return;
    }
    setProfile(myProfile);
    await loadAdminData();
    setAuthPhase('admin');
  };

  useEffect(() => {
    resolveSession();
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      resolveSession();
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const changePage = (p) => {
    setPage(p);
    setPageKey(k => k + 1);
    setSidebarOpen(false);
  };

  const handleAdminSignIn = async (email, password) => {
    await signInAdmin(email, password);
  };

  const handleAdminSignUp = async (email, password) => {
    await signUpAdmin(email, password);
  };

  const handleCreateSociety = async (name) => {
    await createSociety(name);
    await resolveSession();
  };

  const handleResidentLogin = async (flatNumber) => {
    const portal = await getResidentPortal(flatNumber);
    if (!portal) return false;
    setResidentPortal({ ...portal, flatNumber });
    setAuthPhase('resident');
    return true;
  };

  const handleAdminLogout = async () => {
    await signOut();
    setProfile(null);
    setBuildings([]); setFlats([]); setResidents([]); setBills([]); setPayments([]); setExpenses([]); setNotices([]);
  };

  const handleResidentLogout = () => {
    setResidentPortal(null);
    setAuthPhase('login');
  };

  if (authPhase === 'checking') return <PageLoading />;

  if (authPhase === 'login') {
    return <LoginPage onAdminSignIn={handleAdminSignIn} onAdminSignUp={handleAdminSignUp} onResidentLogin={handleResidentLogin} />;
  }

  if (authPhase === 'setup') {
    return <SetupSociety onCreate={handleCreateSociety} />;
  }

  if (authPhase === 'resident') {
    return (
      <Suspense fallback={<PageLoading />}>
        <ResidentPortal
          flat={residentPortal.flat}
          resident={residentPortal.resident}
          bills={residentPortal.bills}
          payments={residentPortal.payments}
          onLogout={handleResidentLogout}
        />
      </Suspense>
    );
  }

  if (dataLoading) return <PageLoading />;

  const societyId = profile.societyId;

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard buildings={buildings} flats={flats} bills={bills} payments={payments} expenses={expenses} />;
      case 'buildings': return <Buildings societyId={societyId} buildings={buildings} setBuildings={setBuildings} flats={flats} />;
      case 'flats': return <FlatsResidents societyId={societyId} buildings={buildings} flats={flats} setFlats={setFlats} residents={residents} setResidents={setResidents} bills={bills} payments={payments} />;
      case 'billing': return <Billing societyId={societyId} buildings={buildings} flats={flats} bills={bills} setBills={setBills} payments={payments} />;
      case 'payments': return <Payments societyId={societyId} flats={flats} bills={bills} setBills={setBills} payments={payments} setPayments={setPayments} />;
      case 'expenses': return <Expenses societyId={societyId} expenses={expenses} setExpenses={setExpenses} />;
      case 'notices': return <Notices societyId={societyId} notices={notices} setNotices={setNotices} />;
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
          <button className="logout-btn" onClick={handleAdminLogout}>
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
