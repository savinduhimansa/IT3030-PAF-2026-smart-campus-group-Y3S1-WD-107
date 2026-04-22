import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, User, Key, Calendar, LogOut, UserPlus, AlertCircle, Bell, Clock } from 'lucide-react';
import spacelinkLogo from '../assets/spacelink-logo.png';
import SpaceLoader from './SpaceLoader';
import { useNotification } from '../context/NotificationContext';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [toast, setToast] = useState(null);
    const [isToastClosing, setIsToastClosing] = useState(false);

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

    // --- NEW: Function to handle notification clicks and route the user ---
    const handleNotificationClick = (notif) => {
        // 1. Mark as read if it's unread
        const isUnread = notif.read === false || notif.isRead === false;
        if (isUnread) {
            markAsRead(notif.id);
        }

        // 2. Close the notification dropdown
        setNotifDropdownOpen(false);

        // 3. Navigate based on notification type
        const type = notif.type ? notif.type.toUpperCase() : '';

        switch (type) {
            case 'BOOKING':
                navigate(role === 'ADMIN' ? '/booking' : '/bookingDetails');
                break;
            case 'TICKET':
            case 'ISSUE':
                navigate('/tickets'); // Change this route if your tickets page is different
                break;
            case 'RESOURCE':
                navigate('/catalogue');
                break;
            case 'WELCOME':
                // For welcome, they are already on dashboard, maybe just show profile
                // navigate('/profile');
                break;
            default:
                // Default fallback
                break;
        }
    };
    // ----------------------------------------------------------------------

    useEffect(() => {
        const handleToast = (e) => {
            setToast(e.detail);
            setIsToastClosing(false);

            setTimeout(() => {
                setIsToastClosing(true);
            }, 4500);

            setTimeout(() => {
                setToast(null);
            }, 5000);
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

            {toast && (
                <div
                    className={`fixed top-24 right-6 md:right-28 z-[1000] w-[340px] bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-2 border-blue-400/80 shadow-[0_15px_50px_rgba(59,130,246,0.4)] backdrop-blur-2xl rounded-2xl p-4 transition-all duration-500 ease-in-out flex gap-4 pointer-events-none 
                    ${isToastClosing
                        ? 'opacity-0 scale-50 -translate-y-16 translate-x-12'
                        : 'opacity-100 scale-100 translate-y-0 translate-x-0 animate-in slide-in-from-top-10 fade-in'
                    }`}
                >
                    <div className="mt-1 bg-blue-500/30 p-2.5 rounded-full flex-shrink-0 h-fit shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <Bell size={20} className="text-blue-200 animate-bounce" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-[15px] font-extrabold text-white m-0 tracking-wide drop-shadow-md">New Notification</h4>
                        <p className="text-[14px] text-white font-medium mt-1.5 m-0 leading-relaxed drop-shadow-md">{toast.message}</p>
                    </div>
                </div>
            )}

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
                                        setNotifDropdownOpen(!notifDropdownOpen);
                                        setDropdownOpen(false);
                                    }}
                                    className="relative p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 focus:outline-none group cursor-pointer border-none bg-transparent"
                                >
                                    <Bell size={22} className={`transition-colors duration-300 ${unreadCount > 0 ? 'text-blue-400 group-hover:text-blue-300' : 'text-slate-200 group-hover:text-white'}`} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-br from-red-500 to-rose-600 rounded-full border border-[#0a0e1a] transform translate-x-1/2 -translate-y-1/2 shadow-lg animate-in zoom-in duration-300">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {notifDropdownOpen && (
                                    <div className="absolute right-0 top-[120%] mt-2 w-80 md:w-[380px] rounded-2xl bg-[#0f172a] shadow-[0_10px_40px_rgba(0,0,0,0.7)] overflow-hidden border border-slate-600 z-[1000] backdrop-blur-3xl transform origin-top-right transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2">
                                        <div className="px-5 py-4 border-b border-slate-700 bg-slate-800/80 flex justify-between items-center">
                                            <h3 className="text-[15px] font-bold text-white m-0 tracking-wide">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="text-[10px] font-bold tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full uppercase border border-blue-500/30">
                                                    {unreadCount} New
                                                </span>
                                            )}
                                        </div>
                                        <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-500 hover:scrollbar-thumb-slate-400 scrollbar-track-transparent">
                                            {notifications.length === 0 ? (
                                                <div className="p-10 flex flex-col items-center justify-center text-center">
                                                    <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
                                                        <Bell className="text-slate-400" size={24} />
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
                                                            // --- NEW: Using the new handleNotificationClick function ---
                                                            onClick={() => handleNotificationClick(notif)}
                                                            className={`p-4 border-b border-slate-700/60 cursor-pointer transition-all duration-300 group relative overflow-hidden ${isUnread ? 'bg-blue-900/30 hover:bg-blue-900/40' : 'bg-transparent hover:bg-slate-800/80'}`}
                                                        >
                                                            {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-r-md"></div>}

                                                            <div className="flex gap-4 items-start pl-2">
                                                                <div className="mt-1 flex-shrink-0 flex items-center justify-center">
                                                                    <div className={`w-2.5 h-2.5 rounded-full ${isUnread ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)] animate-pulse' : 'bg-slate-500'}`}></div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className={`text-[13px] leading-relaxed m-0 transition-colors duration-200 ${isUnread ? 'text-white font-semibold' : 'text-slate-200 group-hover:text-white'}`}>
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
                                }} className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-[#1e293b]/50 border border-gray-700 hover:bg-[#1e293b] transition-all focus:outline-none cursor-pointer">
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
                                    <div className="absolute right-0 mt-3 w-64 rounded-xl bg-[#0f172a] shadow-2xl overflow-hidden py-2 border border-slate-700 z-[1000] backdrop-blur-2xl">
                                        <div className="px-4 py-3 border-b border-slate-700 mb-2 bg-slate-800/60">
                                            <p className="text-sm font-bold truncate mb-1 text-white m-0">{userName}</p>
                                            <p className="text-[11px] font-medium truncate text-slate-400 m-0">{userEmail}</p>
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