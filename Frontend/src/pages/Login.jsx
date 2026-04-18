import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { Zap } from 'lucide-react';
import SpaceLoader from '../components/SpaceLoader';

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

            setTimeout(() => {
                const pendingResourceId = localStorage.getItem('pendingResourceId');
                if (pendingResourceId) {
                    // User came from "Book Now" → go to booking form with resource pre-filled
                    localStorage.removeItem('pendingResourceId');
                    navigate(`/bookingDetails?resourceId=${pendingResourceId}`);
                } else if (userRole === 'ADMIN') {
                    // Normal admin login → unchanged
                    navigate('/dashboard');
                } else {
                    // Normal user login → unchanged
                    navigate('/');
                }
            }, 800);

        } catch (error) {
            setErrorMsg("Login failed: " + (error.response?.data?.message || "Invalid email or password."));
            console.error("Login Error:", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1120] px-4 relative overflow-hidden">

            {isLoading && <SpaceLoader message="Authenticating SpaceLink..." fullScreen={true} />}

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)' }}
            />

            <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="w-[42px] h-[42px] rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                    <Zap size={22} color="white" />
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">SpaceLink</h1>
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