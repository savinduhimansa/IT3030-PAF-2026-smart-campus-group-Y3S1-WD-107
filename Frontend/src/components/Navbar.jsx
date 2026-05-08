import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, User, Key, Calendar, LogOut, UserPlus, Bell, Clock } from 'lucide-react';
import spacelinkLogo from '../assets/spacelink-logo.png';
import SpaceLoader from './SpaceLoader';
import { useNotification } from '../context/NotificationContext';
import toast, { Toaster } from 'react-hot-toast';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [isLocalLoading, setIsLocalLoading] = useState(false);

    // --- NEW: Track scroll position for dynamic navbar ---
    const [isScrolled, setIsScrolled] = useState(false);

    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    const role = localStorage.getItem('role') || 'USER';
    const isLoggedIn = localStorage.getItem('role') !== null;

    const bookingPath = role === 'ADMIN' ? '/booking' : '/bookingDetails';

    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const userName = storedUser.name || storedUser.email?.split('@')[0] || "Guest User";
    const userEmail = storedUser.email || "No email";

    const getInitials = (name) => {
        if (!name || name === "Guest User") return "GU";
        const names = name.trim().split(' ');
        if (names.length >= 2) return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const userInitials = getInitials(userName);

    const notificationContext = useNotification();
    const notifications = notificationContext?.notifications || [];
    const unreadCount = notificationContext?.unreadCount || 0;
    const markAsRead = notificationContext?.markAsRead || (() => {});

    const isLoading = notificationContext?.isLoading || false;

    const isAdmin = role === 'ADMIN';
    const avatarGradient = isAdmin ? 'from-amber-400 to-orange-500' : 'from-blue-500 to-cyan-500';
    const roleColorText = isAdmin ? '#fbbf24' : '#cbd5e1';

    const handleNotificationClick = (notif) => {
        const isUnread = notif.read === false || notif.isRead === false;
        if (isUnread) {
            markAsRead(notif.id);
        }

        setNotifDropdownOpen(false);

        const type = notif.type ? notif.type.toUpperCase() : '';

        switch (type) {
            case 'BOOKING':
                navigate(role === 'ADMIN' ? '/booking' : '/bookingDetails');
                break;
            case 'TICKET':
            case 'ISSUE':
                navigate('/tickets');
                break;
            case 'RESOURCE':
                navigate('/catalogue');
                break;
            case 'WELCOME':
                break;
            default:
                break;
        }
    };

    // --- NEW: Event listener to detect scrolling ---
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleToast = (e) => {
            toast.success(e.detail.message, {
                duration: 4000,
                style: {
                    borderRadius: '16px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(16px)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                },
                iconTheme: {
                    primary: '#3b82f6',
                    secondary: '#ffffff',
                },
            });
        };

        window.addEventListener('show-toast', handleToast);
        return () => window.removeEventListener('show-toast', handleToast);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
            if (notifRef.current && !notifRef.current.contains(event.target)) setNotifDropdownOpen(false);
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
            sessionStorage.removeItem('welcomeToastShown');
            navigate('/');
            setIsLoggingOut(false);
        }, 1000);
    };

    const handleAboutClick = () => {
        if (location.pathname === '/') {
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        navigate('/');
        setTimeout(() => {
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    };

    const handleContactClick = () => {
        if (location.pathname === '/') {
            document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        navigate('/');
        setTimeout(() => {
            document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    };

    return (
        <>
            <style>
                {`
                    .force-white-text-glass p,
                    .force-white-text-glass span,
                    .force-white-text-glass h3 {
                        color: #ffffff !important;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;
                    }
                    .force-white-text-glass .time-text,
                    .force-white-text-glass .time-text span {
                        color: #cbd5e1 !important;
                    }
                `}
            </style>

            {isLoggingOut && <SpaceLoader message="Disconnecting from SpaceLink..." fullScreen={true} />}

            <Toaster position="top-right" reverseOrder={false} containerStyle={{ top: 80, right: 40 }} />

            {/* --- UPDATED: Dynamic classes applied based on isScrolled state --- */}
            <nav
                className={`fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 flex items-center justify-between transition-all duration-500 ease-in-out ${
                    isScrolled
                        ? 'py-2 bg-[#0a0e1a]/95 backdrop-blur-3xl border-b border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.6)]'
                        : 'py-4 bg-[#0a0e1a]/70 backdrop-blur-md border-b border-white/5 shadow-none'
                }`}
                id="home-navbar"
            >

                <Link to="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
                    <img
                        src={spacelinkLogo}
                        alt="SpaceLink Logo"
                        className={`w-auto object-contain transition-all duration-500 drop-shadow-[0_0_15px_rgba(37,99,235,0.4)] ${isScrolled ? 'h-[36px]' : 'h-[42px]'}`}
                    />
                </Link>

                <div className="flex items-center gap-2">
                    {!isLoggedIn ? (
                        <>
                            <Link to="/" className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 no-underline" style={{ color: '#ffffff' }}>Home</Link>
                            <Link to="/catalogue" className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 no-underline" style={{ color: '#ffffff' }}>Catalogue</Link>
                            <button onClick={handleAboutClick} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 bg-transparent border-none cursor-pointer focus:outline-none" style={{ color: '#ffffff' }}>
                                About Us
                            </button>
                            <button onClick={handleContactClick} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 bg-transparent border-none cursor-pointer focus:outline-none" style={{ color: '#ffffff' }}>
                                Contact Us
                            </button>

                            <Link to="/login" className="ml-2 px-6 py-2.5 rounded-xl text-sm font-bold border border-white/20 hover:border-blue-400 hover:bg-blue-500/10 no-underline transition-all duration-300" style={{ color: '#ffffff' }}>
                                Login
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/" className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 no-underline" style={{ color: '#ffffff' }}>Home</Link>
                            <Link to="/catalogue" className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 no-underline" style={{ color: '#ffffff' }}>Catalogue</Link>
                            <Link to={bookingPath} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 no-underline" style={{ color: '#ffffff' }}>Booking</Link>
                            <button onClick={handleAboutClick} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 bg-transparent border-none cursor-pointer focus:outline-none" style={{ color: '#ffffff' }}>
                                About Us
                            </button>
                            <button onClick={handleContactClick} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 bg-transparent border-none cursor-pointer focus:outline-none" style={{ color: '#ffffff' }}>
                                Contact Us
                            </button>

                            <Link to="/tickets" className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 no-underline" style={{ color: '#ffffff' }}>Tickets</Link>

                            <div className="relative ml-2 flex items-center" ref={notifRef}>
                                <button
                                    onClick={() => {
                                        if (!notifDropdownOpen) {
                                            setIsLocalLoading(true);
                                            setTimeout(() => setIsLocalLoading(false), 1200);
                                        }
                                        setNotifDropdownOpen(!notifDropdownOpen);
                                        setDropdownOpen(false);
                                    }}
                                    className="relative p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 focus:outline-none group cursor-pointer border-none bg-transparent"
                                >
                                    <Bell size={22} color={unreadCount > 0 ? '#60a5fa' : '#e2e8f0'} className="transition-colors duration-300" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-extrabold bg-red-500/80 backdrop-blur-md rounded-full border border-red-400/50 shadow-[0_0_12px_rgba(239,68,68,0.6)] transform translate-x-1/2 -translate-y-1/4 z-10 animate-in zoom-in duration-300" style={{ color: '#ffffff' }}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {notifDropdownOpen && (
                                    <div className="force-white-text-glass absolute right-0 top-[120%] mt-2 w-80 md:w-[380px] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden border border-slate-600 z-[1000] backdrop-blur-3xl transform origin-top-right transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2" style={{ backgroundColor: 'rgba(15, 23, 42, 0.96)' }}>

                                        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                            <h3 className="text-[15px] font-bold m-0 tracking-wide drop-shadow-md">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="text-[10px] font-bold tracking-wider bg-blue-500/40 px-2.5 py-1 rounded-full uppercase border border-blue-400/50 shadow-sm">
                                                    {unreadCount} New
                                                </span>
                                            )}
                                        </div>

                                        <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 scrollbar-track-transparent">

                                            {isLoading || isLocalLoading ? (
                                                <div className="flex flex-col">
                                                    {[1, 2, 3].map((skeleton) => (
                                                        <div key={skeleton} className="p-4 border-b border-white/5 flex gap-4 items-start pl-2">
                                                            <div className="mt-1 flex-shrink-0 flex items-center justify-center">
                                                                <div className="w-2.5 h-2.5 rounded-full bg-slate-500 animate-pulse"></div>
                                                            </div>
                                                            <div className="flex-1 w-full">
                                                                <div className="h-3 bg-slate-600 rounded-md w-3/4 mb-3 animate-pulse"></div>
                                                                <div className="h-3 bg-slate-600 rounded-md w-1/2 mb-3 animate-pulse"></div>
                                                                <div className="h-2.5 bg-slate-700 rounded-md w-1/3 animate-pulse"></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : notifications.length === 0 ? (
                                                <div className="p-10 flex flex-col items-center justify-center text-center">
                                                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                                        <Bell size={24} color="#94a3b8" />
                                                    </div>
                                                    <p className="text-[15px] font-bold m-0 drop-shadow-sm">All caught up!</p>
                                                    <p className="time-text text-xs mt-2 m-0 leading-relaxed">No new notifications at the moment.</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => {
                                                    const isUnread = notif.read === false || notif.isRead === false;
                                                    return (
                                                        <div
                                                            key={notif.id}
                                                            onClick={() => handleNotificationClick(notif)}
                                                            className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-300 group relative overflow-hidden ${isUnread ? 'bg-blue-500/20 hover:bg-blue-500/30' : 'bg-transparent hover:bg-white/10'}`}
                                                        >
                                                            {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-r-md"></div>}

                                                            <div className="flex gap-4 items-start pl-2">
                                                                <div className="mt-1 flex-shrink-0 flex items-center justify-center">
                                                                    <div className={`w-2.5 h-2.5 rounded-full ${isUnread ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)] animate-pulse' : 'bg-slate-400'}`}></div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-[13px] leading-relaxed m-0 transition-colors duration-200 drop-shadow-md font-semibold" style={{ opacity: isUnread ? 1 : 0.8 }}>
                                                                        {notif.message}
                                                                    </p>
                                                                    <p className="time-text text-[11px] mt-2 flex items-center gap-1.5 font-medium m-0 drop-shadow-sm">
                                                                        <Clock size={12} color="#cbd5e1" />
                                                                        {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative ml-4" ref={dropdownRef}>
                                <button onClick={() => {
                                    setDropdownOpen(!dropdownOpen);
                                    setNotifDropdownOpen(false);
                                }} className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all focus:outline-none cursor-pointer">
                                    <div className="hidden md:flex flex-col items-end mr-1 ml-3">
                                        <span className="text-[13px] font-bold drop-shadow-sm" style={{ color: '#ffffff' }}>{userName}</span>
                                        <span className="text-[10px] uppercase tracking-widest drop-shadow-sm" style={{ color: roleColorText }}>{role}</span>
                                    </div>

                                    <div className="relative flex items-center justify-center">
                                        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${avatarGradient} blur-[6px] opacity-60 animate-pulse`}></div>
                                        <div className={`relative w-8 h-8 rounded-full bg-gradient-to-r ${avatarGradient} flex items-center justify-center font-bold text-sm shadow-inner border border-white/30`} style={{ color: '#ffffff' }}>
                                            {userInitials}
                                        </div>
                                    </div>

                                    <ChevronDown size={16} color="#ffffff" className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {dropdownOpen && (
                                    <div className="force-white-text-glass absolute right-0 mt-3 w-64 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden py-2 border border-slate-600 z-[1000] backdrop-blur-3xl" style={{ backgroundColor: 'rgba(15, 23, 42, 0.96)' }}>
                                        <div className="px-4 py-3 border-b border-white/10 mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                            <p className="text-sm font-bold truncate mb-1 m-0 drop-shadow-md">{userName}</p>
                                            <p className="time-text text-[11px] font-medium truncate m-0 drop-shadow-sm">{userEmail}</p>
                                        </div>
                                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors no-underline font-medium" onClick={() => setDropdownOpen(false)}>
                                            <User size={16} color="#60a5fa" /> <span>Profile</span>
                                        </Link>
                                        <Link to="/change-password" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors no-underline font-medium" onClick={() => setDropdownOpen(false)}>
                                            <Key size={16} color="#60a5fa" /> <span>Change Password</span>
                                        </Link>
                                        <Link to="/calendar" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors border-b border-white/10 no-underline font-medium pb-3 mb-1" onClick={() => setDropdownOpen(false)}>
                                            <Calendar size={16} color="#60a5fa" /> <span>Calendar</span>
                                        </Link>
                                        {role === 'ADMIN' && (
                                            <Link to="/register" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-500/20 font-bold border-b border-white/10 no-underline mb-1" onClick={() => setDropdownOpen(false)}>
                                                <UserPlus size={16} color="#60a5fa" /> <span>Register New User</span>
                                            </Link>
                                        )}
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-500/20 transition-colors text-left font-bold mt-1 border-none cursor-pointer bg-transparent">
                                            <LogOut size={16} color="#f87171" /> <span style={{ color: '#f87171' }}>Log out</span>
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