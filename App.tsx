
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole, Booking, AuthState } from './types';
import { getStoredUsers, getStoredBookings, getRememberedCredentials } from './services/indexedDBStorage';
import AuthView from './components/AuthView';
import Dashboard from './components/Dashboard';
import DateDetailsView from './components/DateDetailsView';
import AnalyticsView from './components/AnalyticsView';
import { LogOut, Calendar, PieChart, User as UserIcon, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

const MainLayout: React.FC<{ 
  authState: AuthState; 
  handleLogout: () => void; 
  filteredBookings: Booking[]; 
  refreshBookings: () => void; 
}> = ({ authState, handleLogout, filteredBookings, refreshBookings }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col fixed inset-y-0 left-0">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            BookMaster
          </h1>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          <NavLink to="/" icon={<Calendar className="w-5 h-5" />} label="Calendar" />
          <NavLink to="/analytics" icon={<PieChart className="w-5 h-5" />} label="Revenue" />
          {authState.user?.role === UserRole.ADMIN && (
            <NavLink to="/settings" icon={<Settings className="w-5 h-5" />} label="Admin" />
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
              <span className="text-xs font-bold">{authState.user?.name?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-900">{authState.user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{authState.user?.role.toLowerCase()}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around items-center px-4 py-3 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <MobileNavLink to="/" icon={<Calendar className="w-6 h-6" />} label="Calendar" />
        <MobileNavLink to="/analytics" icon={<PieChart className="w-6 h-6" />} label="Revenue" />
        {authState.user?.role === UserRole.ADMIN && (
          <MobileNavLink to="/settings" icon={<Settings className="w-6 h-6" />} label="Admin" />
        )}
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-slate-400 p-2">
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-medium">Exit</span>
        </button>
      </nav>

      {/* Header for mobile */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <h1 className="text-lg font-bold text-indigo-600 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          BookMaster
        </h1>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
          {authState.user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Dashboard bookings={filteredBookings} onRefresh={refreshBookings} /></PageWrapper>} />
            <Route path="/date/:date" element={<PageWrapper><DateDetailsView bookings={filteredBookings} currentUser={authState.user!} onRefresh={refreshBookings} /></PageWrapper>} />
            <Route path="/analytics" element={<PageWrapper><AnalyticsView bookings={filteredBookings} userRole={authState.user?.role || UserRole.USER} /></PageWrapper>} />
            <Route path="/settings" element={
              authState.user?.role === UserRole.ADMIN ? 
              <PageWrapper><div className="max-w-4xl mx-auto"><h2 className="text-2xl font-bold mb-4 text-slate-900">Admin Console</h2><p className="text-slate-500">Global system management and user settings.</p></div></PageWrapper>
              : <Navigate to="/" />
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const initializeApp = async () => {
      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        setAuthState({ user: JSON.parse(storedUser), isAuthenticated: true });
      } else {
        const remembered = getRememberedCredentials();
        if (remembered) {
          try {
            const users = await getStoredUsers();
            const user = users.find(u => u.email === remembered.email && u.password === remembered.password);
            if (user) {
              localStorage.setItem('current_user', JSON.stringify(user));
              setAuthState({ user, isAuthenticated: true });
            }
          } catch (error) {
            console.error('Failed to auto-login with remembered credentials:', error);
          }
        }
      }
      
      try {
        const allBookings = await getStoredBookings();
        setBookings(allBookings);
      } catch (error) {
        console.error('Failed to load bookings:', error);
        setBookings([]);
      }
    };

    initializeApp();
  }, []);

  const handleLogin = async (user: User) => {
    localStorage.setItem('current_user', JSON.stringify(user));
    setAuthState({ user, isAuthenticated: true });
  
    // Load user's bookings after login
    try {
      if (user.role === UserRole.ADMIN) {
        const allBookings = await getStoredBookings();
        setBookings(allBookings);
      } else {
        const userBookings = await getStoredBookings(user.id);
        setBookings(userBookings);
      }
    } catch (error) {
      console.error('Failed to load bookings after login:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    setAuthState({ user: null, isAuthenticated: false });
  };

  const refreshBookings = async () => {
    try {
      if (authState.user?.role === UserRole.ADMIN) {
        const allBookings = await getStoredBookings();
        setBookings(allBookings);
      } else {
        const userBookings = await getStoredBookings(authState.user?.id);
        setBookings(userBookings);
      }
    } catch (error) {
      console.error('Failed to refresh bookings:', error);
    }
  };

  const filteredBookings = useMemo(() => {
    if (!authState.user) return [];
    if (authState.user.role === UserRole.ADMIN) return bookings;
    return bookings.filter(b => b.userId === authState.user?.id);
  }, [bookings, authState.user]);

  if (!authState.isAuthenticated) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <MainLayout 
        authState={authState} 
        handleLogout={handleLogout} 
        filteredBookings={filteredBookings} 
        refreshBookings={refreshBookings} 
      />
    </HashRouter>
  );
};

const NavLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
};

const MobileNavLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-1 p-2 transition-all ${
        isActive ? 'text-indigo-600' : 'text-slate-400'
      }`}
    >
      <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-50' : 'bg-transparent'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </Link>
  );
};

export default App;
