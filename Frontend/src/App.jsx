import { useState } from 'react'
import { Routes, Route, NavLink, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  Menu,
  X,
  Zap,
  Ticket,
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
import BookingDashboard from './components/BookingDetails'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin', label: 'Admin Panel', icon: Settings },
  { path: '/find-best-lab', label: 'Find Best Lab', icon: BookOpen },
  { path: '/tickets', label: 'Tickets', icon: Ticket },
]

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);
  const location = useLocation();
  const hideSidebar = location.pathname.startsWith('/feedbacks/') || location.pathname === '/find-best-lab';

  return (
    <div className="flex min-h-screen relative z-[1]">
      {/* Mobile menu toggle */}
      {!hideSidebar && (
        <button
          className="fixed top-4 left-4 z-[110] w-10 h-10 rounded-xl bg-surface-card border border-border flex items-center justify-center text-text-secondary backdrop-blur-lg md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
          id="mobile-menu-toggle"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Sidebar */}
      {!hideSidebar && (
        <aside
          className={`fixed top-0 left-0 w-[260px] h-screen border-r border-border flex flex-col z-[100] transition-transform duration-250 md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ background: 'linear-gradient(180deg, #0f1629 0%, #0a0e1a 100%)' }}
          id="sidebar"
        >
          <div className="p-5 border-b border-border">
            <Link to="/" className="flex items-center gap-3 no-underline text-inherit">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Zap size={22} color="white" />
              </div>
              <div>
                <h2 className="text-lg font-bold gradient-text">SpaceLink</h2>
                <span className="text-[11px] text-text-muted uppercase tracking-widest">
                  Smart Campus Hub
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-3 flex flex-col gap-1" id="main-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-150 border border-transparent no-underline relative overflow-hidden ${
                    isActive
                      ? 'text-text-primary bg-primary/[0.12] border-border-active shadow-glow'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-glass-hover hover:border-border-hover'
                  }`
                }
                onClick={closeSidebar}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="w-5 h-5 shrink-0" size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-surface-glass border border-border rounded-xl text-xs text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse-dot" />
              <span>System Online</span>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && !hideSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-[99] md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main content */}
      <main className={hideSidebar ? 'flex-1 min-h-screen' : 'ml-0 md:ml-[260px] flex-1 min-h-screen'} id="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/add-feedback" element={<AddFeedback />} />
          <Route path="/feedback/:resourceId" element={<AddFeedback />} />
          <Route path="/feedbacks/:resourceId" element={<AllFeedbacks />} />
          <Route path="/all-feedbacks" element={<AllFeedbacks />} />
          <Route path="/find-best-lab" element={<FindBestLab />} />
          <Route path="/tickets" element={<TicketDashboard />} />
          <Route path="/tickets/new" element={<CreateTicketForm />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/booking" element={<BookingDashboard user={{id: 1}} />} />
        </Routes>
      </main>
    </div>
  );
}




function App() {
  const location = useLocation();
  const isHomepage = location.pathname === '/';
  const isCatalogue = location.pathname === '/catalogue';

  if (isHomepage) {
    return <HomePage />;
  }
  if (isCatalogue) {
    return <Catalogue />;
  }
  return <AppLayout />;
}

export default App
