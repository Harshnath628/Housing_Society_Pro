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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
      <div className="page-loading-shimmer" />
      <div className="page-loading-shimmer" style={{ width: 160 }} />
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
      {/* Terracotta frame — left & right vertical edges */}
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #c4573a, #d4956b 50%, #c4573a)', zIndex: 10 }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #c4573a, #d4956b 50%, #c4573a)', zIndex: 10 }} />
      {/* Inner hairline border */}
      <div className="login-hairline" />
      {/* Floating gold dust particles */}
      <span className="login-dust" /><span className="login-dust" /><span className="login-dust" /><span className="login-dust" />
      <span className="login-dust" /><span className="login-dust" /><span className="login-dust" /><span className="login-dust" />

      {/* Chand Baori stepwell — left */}
      <svg className="login-motif login-motif-stepwell-l" width="110" height="580" viewBox="0 0 110 580" style={{ position: 'absolute', left: 18, top: 60 }} aria-hidden="true">
        <path d="M110,0 L90,0 L90,30 L75,30 L75,60 L60,60 L60,90 L45,90 L45,120 L30,120 L30,150 L15,150 L15,180 L0,180 L0,210 L15,210 L15,240 L30,240 L30,270 L45,270 L45,300 L60,300 L60,330 L75,330 L75,360 L90,360 L90,390 L110,390" fill="none" stroke="#a3402d" strokeWidth="2.4"/>
        <path d="M110,390 L90,390 L90,420 L75,420 L75,450 L60,450 L60,480 L45,480 L45,510 L30,510 L30,540 L45,540 L45,570 L60,570 L60,580" fill="none" stroke="#a3402d" strokeWidth="2"/>
        <line x1="90" y1="0" x2="90" y2="30" stroke="#a3402d" strokeWidth="1.2"/>
        <line x1="75" y1="30" x2="75" y2="60" stroke="#a3402d" strokeWidth="1.2"/>
        <line x1="60" y1="60" x2="60" y2="90" stroke="#a3402d" strokeWidth="1.2"/>
        <line x1="45" y1="90" x2="45" y2="120" stroke="#a3402d" strokeWidth="1.2"/>
        <line x1="30" y1="120" x2="30" y2="150" stroke="#a3402d" strokeWidth="1.2"/>
        <line x1="15" y1="150" x2="15" y2="180" stroke="#a3402d" strokeWidth="1.2"/>
        <path d="M68,72 Q72,65 76,72" fill="none" stroke="#b68235" strokeWidth="1.2"/>
        <path d="M53,102 Q57,95 61,102" fill="none" stroke="#b68235" strokeWidth="1.2"/>
        <path d="M38,132 Q42,125 46,132" fill="none" stroke="#b68235" strokeWidth="1.2"/>
        <path d="M23,162 Q27,155 31,162" fill="none" stroke="#b68235" strokeWidth="1.2"/>
      </svg>

      {/* Chand Baori stepwell — right (mirrored) */}
      <svg className="login-motif login-motif-stepwell-r" width="110" height="580" viewBox="0 0 110 580" style={{ position: 'absolute', right: 18, top: 60, transform: 'scaleX(-1)' }} aria-hidden="true">
        <path d="M110,0 L90,0 L90,30 L75,30 L75,60 L60,60 L60,90 L45,90 L45,120 L30,120 L30,150 L15,150 L15,180 L0,180 L0,210 L15,210 L15,240 L30,240 L30,270 L45,270 L45,300 L60,300 L60,330 L75,330 L75,360 L90,360 L90,390 L110,390" fill="none" stroke="#a3402d" strokeWidth="2.4"/>
        <path d="M110,390 L90,390 L90,420 L75,420 L75,450 L60,450 L60,480 L45,480 L45,510 L30,510 L30,540 L45,540 L45,570 L60,570 L60,580" fill="none" stroke="#a3402d" strokeWidth="2"/>
        <line x1="90" y1="0" x2="90" y2="30" stroke="#a3402d" strokeWidth="1.2"/>
        <line x1="75" y1="30" x2="75" y2="60" stroke="#a3402d" strokeWidth="1.2"/>
        <line x1="60" y1="60" x2="60" y2="90" stroke="#a3402d" strokeWidth="1.2"/>
        <line x1="45" y1="90" x2="45" y2="120" stroke="#a3402d" strokeWidth="1.2"/>
        <line x1="30" y1="120" x2="30" y2="150" stroke="#a3402d" strokeWidth="1.2"/>
        <line x1="15" y1="150" x2="15" y2="180" stroke="#a3402d" strokeWidth="1.2"/>
        <path d="M68,72 Q72,65 76,72" fill="none" stroke="#b68235" strokeWidth="1.2"/>
        <path d="M53,102 Q57,95 61,102" fill="none" stroke="#b68235" strokeWidth="1.2"/>
        <path d="M38,132 Q42,125 46,132" fill="none" stroke="#b68235" strokeWidth="1.2"/>
        <path d="M23,162 Q27,155 31,162" fill="none" stroke="#b68235" strokeWidth="1.2"/>
      </svg>

      {/* Central lotus mandala — proper petals from handoff */}
      <svg className="login-motif login-motif-lotus" width="600" height="600" viewBox="0 0 360 360" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} aria-hidden="true">
        <circle cx="180" cy="180" r="175" fill="none" stroke="#a3402d" strokeWidth="1.8"/>
        <circle cx="180" cy="180" r="160" fill="none" stroke="#b68235" strokeWidth="1.2"/>
        {/* Cardinal petals — gold */}
        <path d="M180,20 Q195,80 180,120 Q165,80 180,20Z" fill="none" stroke="#b68235" strokeWidth="1.6"/>
        <path d="M180,340 Q195,280 180,240 Q165,280 180,340Z" fill="none" stroke="#b68235" strokeWidth="1.6"/>
        <path d="M20,180 Q80,165 120,180 Q80,195 20,180Z" fill="none" stroke="#b68235" strokeWidth="1.6"/>
        <path d="M340,180 Q280,165 240,180 Q280,195 340,180Z" fill="none" stroke="#b68235" strokeWidth="1.6"/>
        {/* Diagonal petals — terracotta */}
        <path d="M67,67 Q120,100 120,120 Q100,120 67,67Z" fill="none" stroke="#a3402d" strokeWidth="1.4"/>
        <path d="M293,67 Q240,100 240,120 Q260,120 293,67Z" fill="none" stroke="#a3402d" strokeWidth="1.4"/>
        <path d="M67,293 Q120,260 120,240 Q100,240 67,293Z" fill="none" stroke="#a3402d" strokeWidth="1.4"/>
        <path d="M293,293 Q240,260 240,240 Q260,240 293,293Z" fill="none" stroke="#a3402d" strokeWidth="1.4"/>
        {/* Intermediate petals */}
        <path d="M110,30 Q140,90 135,130 Q115,100 110,30Z" fill="none" stroke="#a3402d" strokeWidth="1.2"/>
        <path d="M250,30 Q220,90 225,130 Q245,100 250,30Z" fill="none" stroke="#a3402d" strokeWidth="1.2"/>
        <path d="M110,330 Q140,270 135,230 Q115,260 110,330Z" fill="none" stroke="#a3402d" strokeWidth="1.2"/>
        <path d="M250,330 Q220,270 225,230 Q245,260 250,330Z" fill="none" stroke="#a3402d" strokeWidth="1.2"/>
        {/* Inner rings */}
        <circle cx="180" cy="180" r="55" fill="none" stroke="#b68235" strokeWidth="1.6"/>
        <circle cx="180" cy="180" r="40" fill="none" stroke="#a3402d" strokeWidth="1.4"/>
        <circle cx="180" cy="180" r="18" fill="none" stroke="#b68235" strokeWidth="1.5"/>
        <circle cx="180" cy="180" r="6" fill="#b68235" opacity="0.3"/>
      </svg>

      {/* Top pavilion — arched colonnade */}
      <svg className="login-motif login-motif-pavilion" width="180" height="50" viewBox="0 0 180 50" style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)' }} aria-hidden="true">
        <path d="M30,50 L30,25 Q30,8 60,8 L120,8 Q150,8 150,25 L150,50" fill="none" stroke="#a3402d" strokeWidth="2"/>
        <path d="M60,8 L60,0" stroke="#a3402d" strokeWidth="1.4" fill="none"/>
        <path d="M90,8 L90,0" stroke="#a3402d" strokeWidth="1.4" fill="none"/>
        <path d="M120,8 L120,0" stroke="#a3402d" strokeWidth="1.4" fill="none"/>
        <path d="M80,8 Q90,0 100,8" fill="none" stroke="#b68235" strokeWidth="1.5"/>
      </svg>

      {/* Bottom pool — stepped corners */}
      <svg className="login-motif login-motif-pool" width="200" height="60" viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)' }} aria-hidden="true">
        <rect x="20" y="5" width="160" height="50" rx="2" fill="none" stroke="#a3402d" strokeWidth="2"/>
        <rect x="30" y="12" width="140" height="36" rx="1" fill="none" stroke="#a3402d" strokeWidth="1.4"/>
        <line x1="40" y1="30" x2="160" y2="30" stroke="#b68235" strokeWidth="1" strokeDasharray="4,5"/>
        <path d="M20,5 L10,5 L10,15 L5,15 L5,25" fill="none" stroke="#a3402d" strokeWidth="1.4"/>
        <path d="M180,5 L190,5 L190,15 L195,15 L195,25" fill="none" stroke="#a3402d" strokeWidth="1.4"/>
        <path d="M20,55 L10,55 L10,45 L5,45 L5,35" fill="none" stroke="#a3402d" strokeWidth="1.4"/>
        <path d="M180,55 L190,55 L190,45 L195,45 L195,35" fill="none" stroke="#a3402d" strokeWidth="1.4"/>
      </svg>

      {/* Gold ornament above logo */}
      <svg className="login-ornament-top" width="120" height="16" viewBox="0 0 120 16" style={{ marginBottom: 22, opacity: 0.7 }} aria-hidden="true">
        <line x1="0" y1="8" x2="42" y2="8" stroke="#b68235" strokeWidth="1.2"/>
        <circle cx="60" cy="8" r="5" fill="none" stroke="#b68235" strokeWidth="1.4"/>
        <circle cx="60" cy="8" r="2" fill="#b68235" opacity="0.6"/>
        <line x1="78" y1="8" x2="120" y2="8" stroke="#b68235" strokeWidth="1.2"/>
      </svg>

      <div className="login-card" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(12px)', transition: 'all 0.7s cubic-bezier(0.23, 1, 0.32, 1) 0.3s' }}>
        <h1>Society<span style={{ color: 'var(--accent)' }}>Pro</span></h1>
        <p className="subtitle">Society Maintenance Management</p>
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
          <button className="btn btn-outline" type="submit" disabled={busy} style={{ width: '100%', padding: 12, fontSize: 15, fontFamily: "'Yeseva One', serif" }}>
            {busy ? 'Please wait…' : tab === 'admin' ? (adminMode === 'signin' ? 'Sign In' : 'Create Account') : 'Sign In'}
          </button>
        </form>
        {tab === 'admin' && (
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'rgba(58,39,13,0.35)' }}>
            {adminMode === 'signin' ? (
              <>New society? <button type="button" onClick={() => { setAdminMode('signup'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: 11, fontFamily: 'var(--font-body)' }}>Create an account</button></>
            ) : (
              <>Already set up? <button type="button" onClick={() => { setAdminMode('signin'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: 11, fontFamily: 'var(--font-body)' }}>Sign in</button></>
            )}
          </p>
        )}
      </div>

      {/* Diamond ornament below card */}
      <svg className="login-ornament-bottom" width="80" height="16" viewBox="0 0 80 16" style={{ marginTop: 28, opacity: 0.5 }} aria-hidden="true">
        <line x1="0" y1="8" x2="28" y2="8" stroke="#a3402d" strokeWidth="1.2"/>
        <rect x="33" y="3" width="14" height="10" rx="1" fill="none" stroke="#a3402d" strokeWidth="1.4" transform="rotate(45,40,8)"/>
        <line x1="52" y1="8" x2="80" y2="8" stroke="#a3402d" strokeWidth="1.2"/>
      </svg>
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
        <div className="sidebar-ornament" aria-hidden="true">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="0.5" opacity="0.15"/>
            <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="0.3" opacity="0.1"/>
            <path d="M40,8 Q46,22 40,30 Q34,22 40,8Z" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"/>
            <path d="M40,72 Q46,58 40,50 Q34,58 40,72Z" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"/>
            <path d="M8,40 Q22,34 30,40 Q22,46 8,40Z" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"/>
            <path d="M72,40 Q58,34 50,40 Q58,46 72,40Z" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"/>
            <circle cx="40" cy="40" r="6" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.15"/>
            <circle cx="40" cy="40" r="2" fill="currentColor" opacity="0.08"/>
          </svg>
        </div>
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
