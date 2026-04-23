import React, { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { Users, Shield, Wrench, Trash2, Search, AlertCircle, Edit2, X, CheckCircle } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, username: '' });
    const [editModal, setEditModal] = useState({ isOpen: false, user: null });

    // Fetch all users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await authApi.getAllUsers();
            setUsers(response.data || response);
            setError('');
        } catch (err) {
            console.error("Error fetching users:", err);
            setError('Failed to load users. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ==========================================
    // EDIT USER LOGIC
    // ==========================================
    const handleEditClick = (user) => {
        // Open modal with a copy of the user data
        setEditModal({ isOpen: true, user: { ...user } });
    };

    const confirmEdit = async (e) => {
        e.preventDefault();

        const updatedUser = editModal.user;

        // 1. Optimistic UI Update: Close the modal immediately for a snappy UX
        setEditModal({ isOpen: false, user: null });

        // 2. Update the local state instantly so the table reflects the changes
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));

        // 3. Send the actual update request to the backend asynchronously
        try {
            await authApi.updateUser(updatedUser.id, {
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role
            });
        } catch (err) {
            console.error("Error updating user:", err);
            // Revert changes and alert the user if the API call fails
            alert("Failed to update user details. Reverting changes.");
            fetchUsers();
        }
    };
    // ==========================================

    // ==========================================
    // DELETE USER LOGIC
    // ==========================================
    const handleDeleteClick = (userId, username) => {
        setDeleteModal({ isOpen: true, userId, username });
    };

    const confirmDelete = async () => {
        const { userId } = deleteModal;
        try {
            // Optimistically remove user from table
            setUsers(users.filter(user => user.id !== userId));
            // Close modal immediately
            setDeleteModal({ isOpen: false, userId: null, username: '' });

            // Call API
            await authApi.deleteUser(userId);
        } catch (err) {
            console.error("Error deleting user:", err);
            alert("Failed to delete user. Reverting changes.");
            fetchUsers();
            setDeleteModal({ isOpen: false, userId: null, username: '' });
        }
    };

    // ==========================================
    // FILTER & STATS LOGIC
    // ==========================================
    const filteredUsers = users.filter(user => {
        const matchesRole = filterRole === 'ALL' || user.role === filterRole;
        const matchesSearch = (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesSearch;
    });

    const totalUsers = users.length;
    const totalAdmins = users.filter(u => u.role === 'ADMIN').length;
    const totalTechnicians = users.filter(u => u.role === 'TECHNICIAN').length;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8 font-sans animate-in fade-in duration-500 relative">

            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">User Management</h1>
                <p className="text-slate-500 mt-1">Review and manage all campus system users and roles.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Users</p>
                        <h2 className="text-3xl font-bold text-slate-800">{isLoading ? '-' : totalUsers}</h2>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-500">
                        <Users size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-l-4 border-l-purple-500">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">System Admins</p>
                        <h2 className="text-3xl font-bold text-slate-800">{isLoading ? '-' : totalAdmins}</h2>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-purple-500">
                        <Shield size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-l-4 border-l-orange-500">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Technicians</p>
                        <h2 className="text-3xl font-bold text-slate-800">{isLoading ? '-' : totalTechnicians}</h2>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-orange-500">
                        <Wrench size={24} />
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 w-full sm:w-auto">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-4 py-2.5 outline-none transition-colors"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="USER">Standard Users</option>
                        <option value="TECHNICIAN">Technicians</option>
                        <option value="ADMIN">Admins</option>
                    </select>
                </div>

                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 px-4 py-2.5 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Error Message Display */}
            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Main Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">User Details</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-center">System Role</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            // Loading Skeletons
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-5"><div className="h-10 bg-slate-200 rounded-lg w-48"></div></td>
                                    <td className="px-6 py-5"><div className="h-8 bg-slate-200 rounded-full w-32 mx-auto"></div></td>
                                    <td className="px-6 py-5 text-right"><div className="h-8 bg-slate-200 rounded-lg w-16 ml-auto"></div></td>
                                </tr>
                            ))
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                {(user.username || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800">{user.username || 'Unknown User'}</div>
                                                <div className="text-slate-400 text-xs mt-0.5">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {/* Role Badge */}
                                        <span className={`text-[11px] font-bold tracking-wider rounded-full px-4 py-1.5 uppercase border
                                            ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            user.role === 'TECHNICIAN' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                'bg-slate-50 text-slate-600 border-slate-200'}
                                        `}>
                                            {user.role || 'USER'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(user.id, user.username)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Users size={40} className="text-slate-300 mb-3" />
                                        <p>No users found matching your search.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================== */}
            {/* Edit User Modal */}
            {/* ========================================== */}
            {editModal.isOpen && editModal.user && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">Edit User Profile</h3>
                            <button onClick={() => setEditModal({ isOpen: false, user: null })} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={confirmEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editModal.user.username}
                                    onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, username: e.target.value } })}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                <input
                                    type="email"
                                    disabled
                                    value={editModal.user.email}
                                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 px-4 py-2.5 rounded-xl cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">System Role</label>
                                <select
                                    value={editModal.user.role}
                                    onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, role: e.target.value } })}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="USER">Standard User (USER)</option>
                                    <option value="TECHNICIAN">Technician (TECHNICIAN)</option>
                                    <option value="ADMIN">System Administrator (ADMIN)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditModal({ isOpen: false, user: null })}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
                                >
                                    <CheckCircle size={16} />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* Custom Delete Confirmation Modal */}
            {/* ========================================== */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
                                <AlertCircle className="text-red-500" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete User</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Are you sure you want to permanently delete <span className="font-semibold text-slate-700">"{deleteModal.username}"</span>? This action cannot be undone and will remove all their access.
                            </p>
                        </div>
                        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, userId: null, username: '' })}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-sm hover:shadow transition-all"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default UserManagement;