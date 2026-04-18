import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, ChevronDown, User, Key, Calendar, LogOut, UserPlus } from 'lucide-react';
import SpaceLoader from './SpaceLoader';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);

  const role = localStorage.getItem('role') || 'USER';
  const isLoggedIn = localStorage.getItem('role') !== null;

  const storedUser = JSON.parse(localStorage.getItem('user')) || {};

  const userName = storedUser.name || storedUser.email?.split('@')[0] || "Guest User";
  const userEmail = storedUser.email || "No email";

  const getInitials = (name) => {
    if (!name || name === "Guest User") return "GU";
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const userInitials = getInitials(userName);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    setIsLoggingOut(true);

    setTimeout(() => {
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      navigate('/');
      setIsLoggingOut(false);
    }, 1000);
  };

  return (
      <>
        {isLoggingOut && <SpaceLoader message="Disconnecting from SpaceLink..." fullScreen={true} />}

        <nav
            className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 flex items-center justify-between transition-all duration-300 py-4 bg-[#0a0e1a]/85 backdrop-blur-md border-b border-white/5"
            id="home-navbar"
        >
          {/* 🔥 100% BULLETPROOF WHITE LOGO AREA 🔥 */}
          <Link to="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>

            <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shadow-lg"
                 style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', boxShadow: '0 0 15px rgba(37,99,235,0.4)' }}>
              <Zap size={22} color="#ffffff" />
            </div>

            {/* Used <span> and hardcoded inline styles so NO other CSS can break this */}
            <span style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '900',
              letterSpacing: '-0.5px',
              textShadow: '0px 0px 10px rgba(255, 255, 255, 0.5)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              SpaceLink
            </span>

          </Link>

          <div className="flex items-center gap-2">
            {!isLoggedIn ? (
                <>
                  <Link to="/about" className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all duration-150 no-underline">
                    About
                  </Link>
                  <Link to="/login" className="ml-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white border border-white/20 hover:border-blue-400 hover:bg-blue-500/10 transition-all duration-150 no-underline">
                    Login
                  </Link>
                </>
            ) : (
                <>
                  <Link to="/dashboard" className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all duration-150 no-underline">Dashboard</Link>
                  <Link to="/catalogue" className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all duration-150 no-underline">Catalogue</Link>
                  <Link to="/booking" className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all duration-150 no-underline">Booking</Link>

                  <div className="relative ml-4" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-[#1e293b]/50 border border-gray-700 hover:bg-[#1e293b] transition-all focus:outline-none"
                    >
                      <div className="hidden md:flex flex-col items-end mr-1 ml-3">
                        <span className="text-[13px] font-bold text-white">{userName}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">{role}</span>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                        {userInitials}
                      </div>

                      <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-3 w-64 rounded-xl bg-[#0f172a] shadow-[0_10px_40px_rgba(0,0,0,0.7)] overflow-hidden py-2 border border-slate-700 z-[1000] backdrop-blur-2xl">

                          <div className="px-4 py-3 border-b border-slate-700 mb-2 bg-slate-800/60">
                            <p
                                className="text-sm font-bold truncate mb-1"
                                style={{ color: '#ffffff !important', display: 'block' }}
                            >
                              <span style={{ color: '#ffffff' }}>{userName}</span>
                            </p>
                            <p
                                className="text-[11px] font-medium truncate"
                                style={{ color: '#94a3b8 !important', display: 'block' }}
                            >
                              <span style={{ color: '#94a3b8' }}>{userEmail}</span>
                            </p>
                          </div>

                          <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors no-underline text-slate-300 hover:text-white" onClick={() => setDropdownOpen(false)}>
                            <User size={16} className="text-blue-400" /> Profile
                          </Link>
                          <Link to="/change-password" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors no-underline text-slate-300 hover:text-white" onClick={() => setDropdownOpen(false)}>
                            <Key size={16} className="text-blue-400" /> Change Password
                          </Link>
                          <Link to="/calendar" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors border-b border-slate-700/50 no-underline text-slate-300 hover:text-white pb-3 mb-1" onClick={() => setDropdownOpen(false)}>
                            <Calendar size={16} className="text-blue-400" /> Calendar
                          </Link>

                          {role === 'ADMIN' && (
                              <Link to="/register" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-500/20 text-blue-400 font-bold border-b border-slate-700/50 no-underline mb-1" onClick={() => setDropdownOpen(false)}>
                                <UserPlus size={16} /> Register New User
                              </Link>
                          )}

                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-500/20 text-red-400 transition-colors text-left font-bold mt-1">
                            <LogOut size={16} /> Log out
                          </button>
                        </div>
                    )}
                  </div>
                </>
            )}
          </div>
        </nav>
      </>
  );
}