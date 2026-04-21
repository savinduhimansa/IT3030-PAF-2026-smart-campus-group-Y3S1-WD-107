import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authApi } from '../services/api';
import spacelinkLogo from '../assets/spacelink-logo.png';
import SpaceLoader from '../components/SpaceLoader';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

// Import the CSS file for the Astronaut animation
import './AstronautLogin.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const Login = () => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    // Prevent double execution of the OAuth callback in React Strict Mode
    const hasProcessedCode = useRef(false);

    // Animation States
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    // ==========================================
    // --- Member 4: GitHub OAuth 2.0 Logic ---
    // ==========================================
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');

        // Moved function inside useEffect to satisfy ESLint hooks rules
        const processGitHubLogin = async (githubCode) => {
            setIsLoading(true);
            setErrorMsg('');
            try {
                const response = await authApi.githubLogin({ code: githubCode });

                const token = response.data?.token;
                const userRole = response.data?.role || 'USER';
                const userId = response.data?.id;

                if (token) localStorage.setItem('token', token);
                localStorage.setItem('role', userRole);
                if (userId !== undefined && userId !== null) localStorage.setItem('userId', String(userId));

                localStorage.setItem('user', JSON.stringify({
                    name: response.data?.name || "GitHub User",
                    email: response.data?.email || ""
                }));

                try {
                    const userName = response.data?.name || "Space Traveler";
                    await axios.post(`${API_BASE}/notifications/send`, null, {
                        params: {
                            userId: response.data.id,
                            message: `Welcome back to SpaceLink, ${userName}! Ready to book your space?`,
                            type: 'WELCOME'
                        }
                    });
                } catch (notifError) {
                    console.error("Failed to send GitHub login welcome notification:", notifError);
                }

                setTimeout(() => {
                    const pendingResourceId = localStorage.getItem('pendingResourceId');
                    if (pendingResourceId) {
                        localStorage.removeItem('pendingResourceId');
                        window.location.href = `/bookingDetails?resourceId=${pendingResourceId}`;
                    } else if (userRole === 'ADMIN') {
                        window.location.href = '/dashboard';
                    } else {
                        window.location.href = '/';
                    }
                }, 800);

            } catch (error) {
                setErrorMsg("GitHub Login failed at server.");
                console.error("GitHub Server Error:", error);
                setIsLoading(false);
            }
        };

        if (code && !hasProcessedCode.current) {
            hasProcessedCode.current = true;
            window.history.replaceState({}, document.title, location.pathname);

            // Execute the async function
            processGitHubLogin(code).catch(console.error);
        }
    }, [location]);

    const handleGitHubLogin = () => {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    };
    // ==========================================

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        setErrorMsg('');
    };

    const eyeMoveX = isEmailFocused ? Math.min(credentials.email.length * 1.5, 15) : 0;
    const handMoveY = isPasswordFocused ? -65 : 0;
    const leftHandMoveX = isPasswordFocused ? 25 : 0;
    const rightHandMoveX = isPasswordFocused ? -25 : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            const response = await authApi.login(credentials);
            console.log("Login Response:", response.data);

            const token = response.data?.token;
            const userRole = response.data?.role || 'USER';
            const userId = response.data?.id;

            if (token) localStorage.setItem('token', token);
            localStorage.setItem('role', userRole);
            if (userId !== undefined && userId !== null) localStorage.setItem('userId', String(userId));

            localStorage.setItem('user', JSON.stringify({
                name: response.data?.name || credentials.email.split('@')[0],
                email: response.data?.email || credentials.email
            }));

            try {
                const userName = response.data?.name || credentials.email.split('@')[0];
                await axios.post(`${API_BASE}/notifications/send`, null, {
                    params: {
                        userId: response.data.id,
                        message: `Welcome back to SpaceLink, ${userName}! Ready to book your space?`,
                        type: 'WELCOME'
                    }
                });
            } catch (notifError) {
                console.error("Failed to send welcome notification:", notifError);
            }

            setTimeout(() => {
                const pendingResourceId = localStorage.getItem('pendingResourceId');
                if (pendingResourceId) {
                    localStorage.removeItem('pendingResourceId');
                    window.location.href = `/bookingDetails?resourceId=${pendingResourceId}`;
                } else if (userRole === 'ADMIN') {
                    window.location.href = '/dashboard';
                } else {
                    window.location.href = '/';
                }
            }, 800);

        } catch (error) {
            setErrorMsg("Login failed: " + (error.response?.data?.message || "Invalid email or password."));
            console.error("Login Error:", error);
            setIsLoading(false);
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            setErrorMsg('');
            try {
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoResponse.json();
                console.log("Google User Info:", userInfo);

                const response = await authApi.googleLogin({
                    email: userInfo.email,
                    name: userInfo.name,
                    googleId: userInfo.sub
                });

                const token = response.data?.token;
                const userRole = response.data?.role || 'USER';
                const userId = response.data?.id;

                if (token) localStorage.setItem('token', token);
                localStorage.setItem('role', userRole);
                if (userId !== undefined && userId !== null) localStorage.setItem('userId', String(userId));

                localStorage.setItem('user', JSON.stringify({
                    name: response.data?.name || userInfo.name,
                    email: response.data?.email || userInfo.email
                }));

                try {
                    const userName = response.data?.name || userInfo.name;
                    await axios.post(`${API_BASE}/notifications/send`, null, {
                        params: {
                            userId: response.data.id,
                            message: `Welcome back to SpaceLink, ${userName}! Ready to book your space?`,
                            type: 'WELCOME'
                        }
                    });
                } catch (notifError) {
                    console.error("Failed to send Google login welcome notification:", notifError);
                }

                setTimeout(() => {
                    const pendingResourceId = localStorage.getItem('pendingResourceId');
                    if (pendingResourceId) {
                        localStorage.removeItem('pendingResourceId');
                        window.location.href = `/bookingDetails?resourceId=${pendingResourceId}`;
                    } else if (userRole === 'ADMIN') {
                        window.location.href = '/dashboard';
                    } else {
                        window.location.href = '/';
                    }
                }, 800);

            } catch (error) {
                setErrorMsg("Google Login failed at server. Make sure backend endpoint is ready.");
                console.error("Google Server Error:", error);
                setIsLoading(false);
            }
        },
        onError: (error) => {
            setErrorMsg("Google Authentication failed or was closed.");
            console.error("Google Auth Error:", error);
        }
    });

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1120] px-4 relative overflow-hidden">

            {isLoading && <SpaceLoader message="Authenticating SpaceLink..." fullScreen={true} />}

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)' }}
            />

            <div className="mb-8 relative z-10">
                <Link to="/">
                    <img
                        src={spacelinkLogo}
                        alt="SpaceLink Logo"
                        className="h-[45px] md:h-[55px] w-auto object-contain drop-shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-transform hover:scale-105"
                    />
                </Link>
            </div>

            <div className="w-full max-w-[420px] bg-[#1E293B]/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative z-10">

                <div className="astronaut-container mx-auto mb-4">
                    <svg viewBox="0 0 200 200" className="astronaut-svg">
                        <rect x="40" y="40" width="120" height="110" rx="55" className="astro-head" />
                        <rect x="30" y="80" width="15" height="30" rx="5" fill="#94A3B8" />
                        <rect x="155" y="80" width="15" height="30" rx="5" fill="#94A3B8" />
                        <rect x="55" y="60" width="90" height="60" rx="30" className="astro-visor" />
                        <g style={{
                            transform: `translateX(${eyeMoveX}px)`,
                            opacity: isPasswordFocused ? 0 : 1,
                            transition: 'all 0.3s ease-out'
                        }}>
                            <circle cx="85" cy="90" r="6" className="astro-eye" />
                            <circle cx="115" cy="90" r="6" className="astro-eye" />
                        </g>
                        <rect
                            x="30" y="140" width="35" height="25" rx="12"
                            className="astro-hand"
                            style={{ transform: `translate(${leftHandMoveX}px, ${handMoveY}px)` }}
                        />
                        <rect
                            x="135" y="140" width="35" height="25" rx="12"
                            className="astro-hand"
                            style={{ transform: `translate(${rightHandMoveX}px, ${handMoveY}px)` }}
                        />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 text-center">Welcome Back</h2>
                <p className="text-slate-400 text-sm mb-6 text-center">Sign in to manage your campus resources.</p>

                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                        <span className="block sm:inline">{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            onFocus={() => setIsEmailFocused(true)}
                            onBlur={() => setIsEmailFocused(false)}
                            required
                            disabled={isLoading}
                            className="w-full bg-[#0B1120]/50 border border-slate-600 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                            placeholder="you@campus.edu"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            required
                            disabled={isLoading}
                            className="w-full bg-[#0B1120]/50 border border-slate-600 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] mt-4 disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between">
                    <span className="border-b border-slate-600 w-1/5 lg:w-1/4"></span>
                    <span className="text-xs text-center text-slate-400 font-medium uppercase tracking-wider">Or continue with</span>
                    <span className="border-b border-slate-600 w-1/5 lg:w-1/4"></span>
                </div>

                <button
                    type="button"
                    onClick={() => loginWithGoogle()}
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-gray-100 text-slate-800 font-bold py-3 px-4 rounded-xl transition-colors duration-200 mt-6 disabled:opacity-70 flex justify-center items-center gap-3 shadow-lg"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
                </button>

                <button
                    type="button"
                    onClick={handleGitHubLogin}
                    disabled={isLoading}
                    className="w-full bg-[#24292e] hover:bg-[#1a1e22] text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 mt-4 disabled:opacity-70 flex justify-center items-center gap-3 shadow-lg border border-slate-700"
                >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    Sign in with GitHub
                </button>

                <p className="mt-8 text-center text-sm text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;