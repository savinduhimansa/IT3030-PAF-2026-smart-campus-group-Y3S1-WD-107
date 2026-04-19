import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import spacelinkLogo from '../assets/spacelink-logo.png';
import SpaceLoader from '../components/SpaceLoader';

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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1120] px-4 py-12 relative overflow-hidden">

            {/* Show loader when submitting */}
            {isLoading && <SpaceLoader message="Creating SpaceLink Account..." fullScreen={true} />}

            {/* Background Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
            />

            {/* 🔥 NEW SPACELINK IMAGE LOGO AREA */}
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