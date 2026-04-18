import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    User,
    Mail,
    Shield,
    Edit2,
    Save,
    X,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';

const Profile = () => {
    const userId = localStorage.getItem('userId');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [user, setUser] = useState({
        username: '',
        email: '',
        role: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) {
                setMessage({ text: "User session not found. Please login again.", type: 'error' });
                setLoading(false);
                return;
            }

            try {
                // Updated Port to 8090 as requested
                const response = await axios.get(`http://localhost:8090/api/auth/${userId}`);

                if (response.data) {
                    setUser({
                        username: response.data.name || response.data.username || '',
                        email: response.data.email || '',
                        role: response.data.role || 'USER'
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error("Fetch Error:", error);
                setMessage({ text: "Failed to connect to the server.", type: 'error' });
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleSaveProfile = async () => {
        setUpdating(true);
        setMessage({ text: '', type: '' });

        try {
            await axios.put(`http://localhost:8090/api/auth/${userId}`, user);

            const storedUser = JSON.parse(localStorage.getItem('user')) || {};
            localStorage.setItem('user', JSON.stringify({
                ...storedUser,
                name: user.username,
                email: user.email
            }));

            setMessage({ text: "Profile updated successfully!", type: 'success' });
            setIsEditing(false);
        } catch (error) {
            setMessage({ text: "Failed to save changes.", type: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <p className="font-medium tracking-wide">Syncing profile data...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-12 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Account Settings</h1>
                {message.text && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                        message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {message.text}
                    </div>
                )}
            </div>

            <div className="bg-[#1E293B]/40 backdrop-blur-2xl border border-slate-700/50 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="h-40 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 relative">
                    <div className="absolute -bottom-16 left-10 p-1.5 bg-[#0B1120] rounded-[28px]">
                        <div className="w-28 h-28 rounded-[24px] bg-[#1e293b] border border-slate-700 flex items-center justify-center text-4xl font-black text-blue-400 shadow-2xl shadow-blue-500/20">
                            {user.username ? user.username.substring(0, 2).toUpperCase() : '??'}
                        </div>
                    </div>
                </div>

                <div className="pt-20 p-6 md:p-12">
                    {/* Header Info - Added mt-8 to make it "path" / lowered */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 mt-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-1">{user.username || "Anonymous User"}</h2>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Shield size={14} className="text-blue-400" />
                                <span className="uppercase text-[11px] font-bold tracking-[0.2em]">{user.role || 'USER'}</span>
                            </div>
                        </div>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white border border-slate-700 rounded-2xl hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 font-semibold"
                            >
                                <Edit2 size={18} />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button onClick={handleSaveProfile} disabled={updating} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold disabled:opacity-50">
                                    {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Save
                                </button>
                                <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-slate-800 text-white rounded-2xl hover:bg-slate-700 transition-all font-bold border border-slate-700">
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <div>
                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                                <User size={12} className="text-blue-500" />
                                Display Name
                            </label>
                            <input
                                disabled={!isEditing}
                                type="text"
                                value={user.username}
                                onChange={(e) => setUser({...user, username: e.target.value})}
                                className="w-full bg-[#0B1120]/50 border border-slate-700 text-white px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                                <Shield size={12} className="text-blue-500" />
                                Assigned Role
                            </label>
                            <input disabled type="text" value={user.role} className="w-full bg-[#0B1120]/20 border border-slate-800 text-slate-500 px-5 py-4 rounded-2xl cursor-not-allowed italic" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                                <Mail size={12} className="text-blue-500" />
                                Email Address
                            </label>
                            <input
                                disabled={!isEditing}
                                type="email"
                                value={user.email}
                                onChange={(e) => setUser({...user, email: e.target.value})}
                                className="w-full bg-[#0B1120]/50 border border-slate-700 text-white px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;