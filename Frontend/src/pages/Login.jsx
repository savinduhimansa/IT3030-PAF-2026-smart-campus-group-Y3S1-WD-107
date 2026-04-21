import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import spacelinkLogo from '../assets/spacelink-logo.png';
import SpaceLoader from '../components/SpaceLoader';
import { useGoogleLogin } from '@react-oauth/google';

// --- NEW: Added axios and API_BASE for sending Welcome Notifications ---
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
// ----------------------------------------------------------------------

const Login = () => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        setErrorMsg('');
    };

    // 🟢 Normal Email/Password Login
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

            // --- NEW: Send Welcome Notification after successful normal login ---
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
            // ------------------------------------------------------------------

            // --- NEW: Use window.location.href instead of navigate for fresh context load ---
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
            // --------------------------------------------------------------------------------

        } catch (error) {
            setErrorMsg("Login failed: " + (error.response?.data?.message || "Invalid email or password."));
            console.error("Login Error:", error);
            setIsLoading(false);
        }
    };

    // 🔵 New Google Login Function
    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            setErrorMsg('');
            try {
                // 1. Get user details from Google
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoResponse.json();
                console.log("Google User Info:", userInfo);

                // 2. Send to Backend (You will need an authApi.googleLogin endpoint)
                // Note: If backend endpoint is not ready, this might throw an error,
                // but the Google popup will still work perfectly!
                const response = await authApi.googleLogin({
                    email: userInfo.email,
                    name: userInfo.name,
                    googleId: userInfo.sub
                });

                // 3. Handle success identically to normal login
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

                // --- NEW: Send Welcome Notification after successful Google login ---
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
                // ------------------------------------------------------------------

                // --- NEW: Use window.location.href instead of navigate for fresh context load ---
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
                // --------------------------------------------------------------------------------

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

            {/* 🔥 SPACELINK IMAGE LOGO AREA */}
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
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-slate-400 text-sm mb-6">Sign in to manage your campus resources.</p>

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

                {/* 🔥 NEW GOOGLE LOGIN SECTION */}
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
                    {/* Google SVG Logo */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
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