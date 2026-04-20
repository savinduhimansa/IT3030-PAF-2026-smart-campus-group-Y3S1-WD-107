import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import spacelinkLogo from '../assets/spacelink-logo.png';
import SpaceLoader from '../components/SpaceLoader';
import { useGoogleLogin } from '@react-oauth/google'; // ✅ Google Auth Import

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorMsg('');
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // 🟢 Normal Form Registration
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!validateEmail(formData.email)) {
            setErrorMsg("Please enter a valid email address.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrorMsg("Passwords do not match! Please try again.");
            return;
        }

        if (formData.password.length < 4) {
            setErrorMsg("Password must be at least 4 characters long.");
            return;
        }

        setIsLoading(true); // Start Loading

        try {
            // eslint-disable-next-line no-unused-vars
            const { confirmPassword, ...dataToSend } = formData;
            const response = await authApi.register(dataToSend);
            console.log("Response:", response);

            // Add a small delay for a smooth transition
            setTimeout(() => {
                navigate('/login');
            }, 800);

        } catch (error) {
            setErrorMsg("Registration failed: " + (error.response?.data?.message || error.message));
            console.error(error);
            setIsLoading(false); // Stop loading on error
        }
    };

    // 🔵 New Google Registration/Login Function
    const registerWithGoogle = useGoogleLogin({
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

                // 2. Send to Backend (Backend handles both registering new and logging in existing Google users)
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

                // Auto redirect to Home/Dashboard after successful Google Registration
                setTimeout(() => {
                    const pendingResourceId = localStorage.getItem('pendingResourceId');
                    if (pendingResourceId) {
                        localStorage.removeItem('pendingResourceId');
                        navigate(`/bookingDetails?resourceId=${pendingResourceId}`);
                    } else if (userRole === 'ADMIN') {
                        navigate('/dashboard');
                    } else {
                        navigate('/');
                    }
                }, 800);

            } catch (error) {
                setErrorMsg("Google Registration failed at server. Please try again.");
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1120] px-4 py-12 relative overflow-hidden">

            {/* Show loader when submitting */}
            {isLoading && <SpaceLoader message="Creating SpaceLink Account..." fullScreen={true} />}

            {/* Background Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
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

            {/* Register Card */}
            <div className="w-full max-w-[450px] bg-[#1E293B]/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative z-10">
                <h2 className="text-2xl font-bold text-white mb-2">Create an Account</h2>
                <p className="text-slate-400 text-sm mb-6">Join SpaceLink to book and manage campus facilities.</p>

                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                        <span className="block sm:inline">{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="w-full bg-[#0B1120]/50 border border-slate-600 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="w-full bg-[#0B1120]/50 border border-slate-600 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                            placeholder="john@campus.edu"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="w-full bg-[#0B1120]/50 border border-slate-600 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
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
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] mt-6 disabled:opacity-70"
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                {/* 🔥 NEW GOOGLE REGISTRATION SECTION */}
                <div className="mt-6 flex items-center justify-between">
                    <span className="border-b border-slate-600 w-1/5 lg:w-1/4"></span>
                    <span className="text-xs text-center text-slate-400 font-medium uppercase tracking-wider">Or continue with</span>
                    <span className="border-b border-slate-600 w-1/5 lg:w-1/4"></span>
                </div>

                <button
                    type="button"
                    onClick={() => registerWithGoogle()}
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
                    Sign up with Google
                </button>

                <p className="mt-8 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;