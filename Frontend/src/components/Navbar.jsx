import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, User, Key, Calendar, LogOut, UserPlus, Bell, Clock } from 'lucide-react';
import spacelinkLogo from '../assets/spacelink-logo.png';
import SpaceLoader from './SpaceLoader';
import { useNotification } from '../context/NotificationContext';

// --- NEW: Import React Hot Toast ---
import toast, { Toaster } from 'react-hot-toast';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [isLocalLoading, setIsLocalLoading] = useState(false);

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

    // --- UPDATED: Replaced custom toast logic with React Hot Toast ---
    useEffect(() => {
        const handleToast = (e) => {
            // Trigger the modern toast
            toast.success(e.detail.message, {
                duration: 4000,
                style: {
                    borderRadius: '16px',
                    background: 'rgba(15, 23, 42, 0.7)', // Glassy dark background
                    backdropFilter: 'blur(16px)', // Blur effect
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                },
                iconTheme: {
                    primary: '#3b82f6', // Blue accent
                    secondary: '#fff',
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
            {isLoggingOut && <SpaceLoader message="Disconnecting from SpaceLink..." fullScreen={true} />}

            {/* --- NEW: The Toaster Component from react-hot-toast --- */}
            <Toaster position="top-right" reverseOrder={false} containerStyle={{ top: 80, right: 40 }} />

            <nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 flex items-center justify-between transition-all duration-300 py-4 bg-[#0a0e1a]/85 backdrop-blur-md border-b border-white/5" id="home-navbar">

                <Link to="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
                    <img
                        src={spacelinkLogo}
                        alt="SpaceLink Logo"
                        className="h-[42px] w-auto object-contain drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    />
                </Link>

                <div className="flex items-center gap-2">
                    {!isLoggedIn ? (
                        <>
                            <Link to="/" className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 no-underline">Home</Link>
                            <Link to="/catalogue" className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 no-underline">Catalogue</Link>
                            <button onClick={handleAboutClick} className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 bg-transparent border-none cursor-pointer focus:outline-none">
                                About Us
                            </button>
                            <button onClick={handleContactClick} className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 bg-transparent border-none cursor-pointer focus:outline-none">
                                Contact Us
                            </button>

                            <Link to="/login" className="ml-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white border border-white/20 hover:border-blue-400 hover:bg-blue-500/10 no-underline">
                                Login
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/" className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 no-underline">Home</Link>
                            <Link to="/catalogue" className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 no-underline">Catalogue</Link>
                            <Link to={bookingPath} className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 no-underline">Booking</Link>
                            <button onClick={handleAboutClick} className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 bg-transparent border-none cursor-pointer focus:outline-none">
                                About Us
                            </button>
                            <button onClick={handleContactClick} className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 bg-transparent border-none cursor-pointer focus:outline-none">
                                Contact Us
                            </button>

                            <Link to="/tickets" className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 no-underline">Tickets</Link>

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
                                    <Bell size={22} className={`transition-colors duration-300 ${unreadCount > 0 ? 'text-blue-400 group-hover:text-blue-300' : 'text-slate-200 group-hover:text-white'}`} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-extrabold text-white bg-red-500/80 backdrop-blur-md rounded-full border border-red-400/50 shadow-[0_0_12px_rgba(239,68,68,0.6)] transform translate-x-1/2 -translate-y-1/4 z-10 animate-in zoom-in duration-300">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {notifDropdownOpen && (
                                    // --- UPDATED: Extreme Glassmorphism styles applied here ---
                                    <div className="absolute right-0 top-[120%] mt-2 w-80 md:w-[380px] rounded-2xl bg-[#0f172a]/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 z-[1000] backdrop-blur-2xl transform origin-top-right transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2">

                                        <div className="px-5 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                            <h3 className="text-[15px] font-bold text-white m-0 tracking-wide">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="text-[10px] font-bold tracking-wider bg-blue-500/30 text-blue-200 px-2.5 py-1 rounded-full uppercase border border-blue-400/30">
                                                    {unreadCount} New
                                                </span>
                                            )}
                                        </div>

                                        <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 scrollbar-track-transparent">

                                            {isLoading || isLocalLoading ? (
                                                <div className="flex flex-col">
                                                    {[1, 2, 3].map((skeleton) => (
                                                        <div key={skeleton} className="p-4 border-b border-white/5 flex gap-4 items-start pl-2">
                                                            <div className="mt-1 flex-shrink-0 flex items-center justify-center">
                                                                <div className="w-2.5 h-2.5 rounded-full bg-white/20 animate-pulse"></div>
                                                            </div>
                                                            <div className="flex-1 w-full">
                                                                <div className="h-3 bg-white/20 rounded-md w-3/4 mb-3 animate-pulse"></div>
                                                                <div className="h-3 bg-white/20 rounded-md w-1/2 mb-3 animate-pulse"></div>
                                                                <div className="h-2.5 bg-white/10 rounded-md w-1/3 animate-pulse"></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : notifications.length === 0 ? (
                                                <div className="p-10 flex flex-col items-center justify-center text-center">
                                                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                                        <Bell className="text-white/40" size={24} />
                                                    </div>
                                                    <p className="text-[15px] font-semibold text-slate-200 m-0">All caught up!</p>
                                                    <p className="text-xs text-slate-400 mt-2 m-0 leading-relaxed">No new notifications at the moment.</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => {
                                                    const isUnread = notif.read === false || notif.isRead === false;
                                                    return (
                                                        <div
                                                            key={notif.id}
                                                            onClick={() => handleNotificationClick(notif)}
                                                            className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-300 group relative overflow-hidden ${isUnread ? 'bg-blue-500/10 hover:bg-blue-500/20' : 'bg-transparent hover:bg-white/5'}`}
                                                        >
                                                            {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-r-md"></div>}

                                                            <div className="flex gap-4 items-start pl-2">
                                                                <div className="mt-1 flex-shrink-0 flex items-center justify-center">
                                                                    <div className={`w-2.5 h-2.5 rounded-full ${isUnread ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)] animate-pulse' : 'bg-white/30'}`}></div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className={`text-[13px] leading-relaxed m-0 transition-colors duration-200 ${isUnread ? 'text-white font-semibold' : 'text-slate-300 group-hover:text-white'}`}>
                                                                        {notif.message}
                                                                    </p>
                                                                    <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 font-medium m-0">
                                                                        <Clock size={12} />
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
                                }} className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all focus:outline-none cursor-pointer">
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
                                    <div className="absolute right-0 mt-3 w-64 rounded-xl bg-[#0f172a]/70 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden py-2 border border-white/10 z-[1000] backdrop-blur-2xl">
                                        <div className="px-4 py-3 border-b border-white/10 mb-2 bg-white/5">
                                            <p className="text-sm font-bold truncate mb-1 text-white m-0">{userName}</p>
                                            <p className="text-[11px] font-medium truncate text-slate-400 m-0">{userEmail}</p>
                                        </div>
                                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors no-underline text-slate-300 hover:text-white" onClick={() => setDropdownOpen(false)}>
                                            <User size={16} className="text-blue-400" /> Profile
                                        </Link>
                                        <Link to="/change-password" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors no-underline text-slate-300 hover:text-white" onClick={() => setDropdownOpen(false)}>
                                            <Key size={16} className="text-blue-400" /> Change Password
                                        </Link>
                                        <Link to="/calendar" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors border-b border-white/10 no-underline text-slate-300 hover:text-white pb-3 mb-1" onClick={() => setDropdownOpen(false)}>
                                            <Calendar size={16} className="text-blue-400" /> Calendar
                                        </Link>
                                        {role === 'ADMIN' && (
                                            <Link to="/register" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-500/20 text-blue-400 font-bold border-b border-white/10 no-underline mb-1" onClick={() => setDropdownOpen(false)}>
                                                <UserPlus size={16} /> Register New User
                                            </Link>
                                        )}
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-500/20 text-red-400 transition-colors text-left font-bold mt-1 border-none cursor-pointer bg-transparent">
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