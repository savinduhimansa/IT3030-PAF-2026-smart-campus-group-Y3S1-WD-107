import React, { useState } from 'react';
import axios from 'axios';
import { Key, ShieldCheck, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const ChangePassword = () => {
    const userId = localStorage.getItem('userId');
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({ text: '', type: '' });

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMsg({ text: "New passwords do not match!", type: "error" });
            return;
        }

        setLoading(true);
        try {
            // Port 8090
            const response = await axios.put(`http://localhost:8090/api/auth/${userId}/change-password`, {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });

            setMsg({ text: response.data.message || "Password updated successfully!", type: "success" });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error("Full Error Object:", error);

            // Extracting the exact error message from Backend JSON
            const exactError = error.response?.data?.error || "Connection error. Please try again.";

            setMsg({ text: exactError, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-xl mx-auto animate-in fade-in duration-500">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">Security Settings</h1>

            <div className="bg-[#1E293B]/40 backdrop-blur-2xl border border-slate-700/50 rounded-[32px] p-8 md:p-10 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-inner">
                        <ShieldCheck className="text-blue-400" size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Update Password</h2>
                        <p className="text-sm text-slate-400 mt-1">Ensure your account stays secure</p>
                    </div>
                </div>

                {msg.text && (
                    <div className={`p-4 rounded-2xl mb-8 text-sm flex items-center gap-3 border font-medium ${
                        msg.type === 'success'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                        {msg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        {msg.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="group">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                        <input
                            type="password"
                            required
                            value={passwords.currentPassword}
                            className="w-full bg-[#0B1120]/50 border border-slate-700 text-white px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                            onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="h-px bg-slate-700/50 my-4" />

                    <div className="group">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">New Password</label>
                        <input
                            type="password"
                            required
                            value={passwords.newPassword}
                            className="w-full bg-[#0B1120]/50 border border-slate-700 text-white px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                            onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="group">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            value={passwords.confirmPassword}
                            className="w-full bg-[#0B1120]/50 border border-slate-700 text-white px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Key size={20} />}
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;