import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  Menu,
  X,
  Zap,
  Ticket,
  LogOut,
  AlertCircle,
} from 'lucide-react'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import Catalogue from './pages/Catalogue'
import AdminPanel from './pages/AdminPanel'
import AddFeedback from './pages/AddFeedback'
import AllFeedbacks from './pages/AllFeedbacks'
import FindBestLab from './pages/FindBestLab'
import TicketDashboard from './pages/TicketDashboard'
import TicketDetail from './pages/TicketDetail'
import CreateTicketForm from './components/CreateTicketForm'
import Register from './pages/Register'
import Login from './pages/Login'
import BookingDashboard from './pages/BookingDashboard'
import BookingDetails from './components/BookingDetails'
import Navbar from './components/Navbar'
import Profile from './pages/Profile' // New Import
import ChangePassword from './pages/ChangePassword' // New Import
import { ProtectedRoute } from './components/ProtectedRoute'

const baseNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin', label: 'Resources', icon: Settings, adminOnly: true },
  { path: '/tickets', label: 'Tickets', icon: Ticket },
]

// Internal Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-notification flex items-center gap-3 ${type === 'error' ? 'border-red-500' : 'border-blue-500'}`}>
      <AlertCircle size={18} className={type === 'error' ? 'text-red-500' : 'text-blue-500'} />
      <span className="text-white font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        <X size={14} className="text-white/50" />
      </button>
    </div>
  );
};

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeSidebar = () => setSidebarOpen(false);
  const hideSidebar =
      location.pathname.includes('feedback') ||
      location.pathname === '/find-best-lab' ||
      location.pathname === '/register' ||
      location.pathname === '/login';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user'); // Important: Clear user data too
    localStorage.setItem('userId', '');
    navigate('/');
  };

  const userRole = localStorage.getItem('role');
  const userIdRaw = localStorage.getItem('userId');
  const userId = userIdRaw ? Number(userIdRaw) : null;
  const user = userId ? { id: userId, role: userRole || 'USER' } : null;

  const navItems = [
    ...baseNavItems,
    {
      path: userRole === 'ADMIN' ? '/booking' : '/bookingDetails',
      label: 'Booking',
      icon: BookOpen,
    },
  ];

  const visibleNavItems = navItems.filter(item => !item.adminOnly || userRole === 'ADMIN');

  return (
      <div className="flex min-h-screen relative z-[1]">
        {!hideSidebar && (
            <button
                className="fixed top-4 left-4 z-[110] w-10 h-10 rounded-xl bg-surface-card border border-border flex items-center justify-center text-text-secondary backdrop-blur-lg md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
        )}

        {!hideSidebar && (
            <aside
                className={`fixed top-0 left-0 w-[260px] h-screen border-r border-border flex flex-col z-[100] transition-transform duration-250 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ background: 'linear-gradient(180deg, #0f1629 0%, #0a0e1a 100%)' }}
            >
              <div className="p-5 border-b border-border">
                <Link to="/" className="flex items-center gap-3 no-underline text-inherit">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-glow">
                    <Zap size={22} color="white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold gradient-text">SpaceLink</h2>
                    <span className="text-[11px] text-text-muted uppercase tracking-widest">Smart Campus Hub</span>
                  </div>
                </Link>
              </div>

              <nav className="flex-1 p-3 flex flex-col gap-1">
                {visibleNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all ${isActive ? 'text-text-primary bg-primary/[0.12] border-border-active shadow-glow' : 'text-text-secondary hover:text-text-primary hover:bg-surface-glass-hover'}`
                        }
                        onClick={closeSidebar}
                    >
                      <item.icon className="w-5 h-5 shrink-0" size={20} />
                      <span>{item.label}</span>
                    </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-border flex flex-col gap-3">
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all w-full">
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </aside>
        )}

        {sidebarOpen && !hideSidebar && (
            <div className="fixed inset-0 bg-black/50 z-[99] md:hidden" onClick={closeSidebar} />
        )}

        <main className={hideSidebar ? 'flex-1 min-h-screen' : 'ml-0 md:ml-[260px] flex-1 min-h-screen'}>
          <Navbar /> {/* Ensure Navbar is displayed globally inside AppLayout */}
          <div className="pt-20"> {/* Add padding for the fixed navbar */}
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/admin"
                element={<ProtectedRoute element={<AdminPanel />} user={user} allowedRoles={['ADMIN']} />}
              />
              <Route path="/catalogue" element={<Catalogue />} />
              <Route path="/add-feedback" element={<AddFeedback />} />
              <Route path="/feedback/:resourceId" element={<AddFeedback />} />
              <Route path="/feedbacks/:resourceId" element={<AllFeedbacks />} />
              <Route path="/all-feedbacks" element={<AllFeedbacks />} />
              <Route path="/find-best-lab" element={<FindBestLab />} />
              <Route path="/tickets" element={<TicketDashboard />} />
              <Route path="/tickets/new" element={<CreateTicketForm />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
              <Route path="/profile" element={<Profile />} /> {/* Profile Route */}
              <Route path="/change-password" element={<ChangePassword />} /> {/* Change Password Route */}
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/booking"
                element={<ProtectedRoute element={<BookingDashboard user={user} />} user={user} allowedRoles={['ADMIN']} />}
              />
              <Route path="/bookingDetails" element={<ProtectedRoute element={<BookingDetails user={user} />} user={user} />} />
            </Routes>
          </div>
        </main>
      </div>
  );
}

function App() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleToast = (e) => {
      setToast(e.detail);
    };
    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  const location = useLocation();
  const isHomepage = location.pathname === '/';
  const isCatalogue = location.pathname === '/catalogue';

  const renderContent = () => {
    if (isHomepage) return <HomePage />;
    if (isCatalogue) return <Catalogue />;
    return <AppLayout />;
  };

  return (
    <>
      {renderContent()}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default App;