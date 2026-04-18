
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Plus, Calendar, Clock, MapPin, XCircle, FileText, User as UserIcon, CheckCircle, X as XIcon } from 'lucide-react';
import { getMyBookings, createBooking, cancelBooking, updateBooking, getBookingHistory } from '../services/api';

import BookingModal from './BookingModal';


// Booking history modal
function BookingHistoryModal({ isOpen, onClose, history }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
                    <XIcon size={22} />
                </button>
                <h2 className="text-lg font-bold mb-4 text-[#4F46E5]">Booking History</h2>
                {history.length === 0 ? (
                    <div className="text-gray-500 text-sm">No history found.</div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {history.map((h, i) => (
                            <li key={i} className="py-2 flex flex-col">
                                <span className="font-semibold text-[#0F172A]">{h.status}</span>
                                <span className="text-xs text-gray-500">{new Date(h.changedAt).toLocaleString()} by {h.changedBy}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}






// Stat summary card
function StatCard({ label, value, color, icon }) {
    return (
        <div className="flex items-center bg-white rounded-xl shadow" style={{borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}`}}>
            <div className="p-3 text-xl" style={{color}}>{icon}</div>
            <div className="flex flex-col px-3 py-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">{label}</span>
                <span className="text-[22px] font-extrabold text-[#0F172A] leading-tight">{value}</span>
            </div>
        </div>
    );
}


function BookingDashboard({ user }) {
    const [bookings, setBookings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingBooking, setEditingBooking] = useState(null); 
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);

    const [searchParams] = useSearchParams();
    const resourceIdFromUrl = searchParams.get('resourceId');

    useEffect(() => {
        if (resourceIdFromUrl) {
            setIsModalOpen(true); // Auto-open the booking form
        }
    }, [resourceIdFromUrl]);
    // Show booking history modal
    const handleShowHistory = async (bookingId) => {
        try {
            setError('');
            const data = await getBookingHistory(bookingId);
            setHistoryData(data);
            setHistoryModalOpen(true);
        } catch (err) {
            setError('Failed to fetch booking history.');
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await getMyBookings(user.id);
            setBookings(data);
        } catch (err) {
            setError('Failed to fetch bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [user.id]);

    // Handles both create and update
    const handleSubmitBooking = async (formData) => {
        try {
            setError('');
            if (editingBooking) {
                await updateBooking(user.id, editingBooking.id, formData);
            } else {
                await createBooking(user.id, formData);
            }
            setIsModalOpen(false);
            setEditingBooking(null);
            fetchBookings();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save booking.');
        }
    };

    const handleCancelBooking = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await cancelBooking(user.id, id);
            fetchBookings();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to cancel booking.');
        }
    };

    // Stat counts
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'PENDING').length;
    const approved = bookings.filter(b => b.status === 'APPROVED').length;
    const rejected = bookings.filter(b => b.status === 'REJECTED').length;

    // Status badge colors
    const statusColors = {
        PENDING: { bg: '#FFFBEB', color: '#F59E0B', text: '#F59E0B', border: '#F59E0B' },
        APPROVED: { bg: '#ECFDF5', color: '#10B981', text: '#10B981', border: '#10B981' },
        REJECTED: { bg: '#FEF2F2', color: '#EF4444', text: '#EF4444', border: '#EF4444' },
        CANCELLED: { bg: '#F1F5F9', color: '#64748B', text: '#64748B', border: '#64748B' },
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24">
            <main className="px-8 py-10">
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-[28px] font-bold text-[#0F172A]">My Bookings</h1>
                    <span className="text-[14px] text-[#64748B] font-medium">View and manage your campus reservations</span>
                </div>
                {/* Stat summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    <StatCard label="Total" value={total} color="#4F46E5" icon={<FileText size={22} />} />
                    <StatCard label="Pending" value={pending} color="#F59E0B" icon={<Clock size={22} />} />
                    <StatCard label="Approved" value={approved} color="#10B981" icon={<CheckCircle size={22} />} />
                    <StatCard label="Rejected" value={rejected} color="#EF4444" icon={<XIcon size={22} />} />
                </div>

                <div className="flex justify-between items-center mb-6">
                    <div />
                    <button
                        onClick={() => { setIsModalOpen(true); setEditingBooking(null); }}
                        className="flex items-center gap-2 bg-[#4F46E5] text-white px-5 py-2.5 rounded-lg font-semibold shadow hover:bg-[#4338CA] transition-colors"
                        style={{borderRadius: 8, fontFamily: 'Inter, sans-serif'}}
                    >
                        <Plus size={20} /> New Booking
                    </button>
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm text-sm font-medium animate-pulse mb-6">{error}</div>}

                {/* Booking cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-white rounded-xl h-56 shadow" style={{borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)'}}></div>
                        ))
                    ) : bookings.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-[#E2E8F0] rounded-xl" style={{borderRadius: 12}}>
                            <div className="w-20 h-20 flex items-center justify-center bg-[#F8FAFC] border-2 border-dashed border-[#E2E8F0] rounded-full mb-4">
                                <Calendar className="text-[#4F46E5]" size={40} />
                            </div>
                            <span className="text-xl font-semibold text-[#64748B] mb-2">No bookings yet</span>
                            <span className="text-[14px] text-[#64748B] mb-4">Create your first booking to get started.</span>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-[#4338CA] transition-colors"
                                style={{borderRadius: 8, fontFamily: 'Inter, sans-serif'}}
                            >Create your first booking</button>
                        </div>
                    ) : (
                        bookings.map(b => (
                            <div key={b.id} className="relative bg-white flex flex-col shadow group" style={{borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)', borderLeft: `4px solid ${statusColors[b.status]?.color || '#E2E8F0'}`}}>
                                <div className="flex justify-between items-start p-5 pb-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="inline-block px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[11px]" style={{background: statusColors[b.status]?.bg, color: statusColors[b.status]?.text, borderRadius: 20, fontWeight: 600}}>{b.status}</span>
                                        <span className="text-[16px] font-bold text-[#0F172A] mt-2">{b.resourceId}</span>
                                        <span className="text-[13px] text-[#64748B] font-medium mt-1">{b.purpose}</span>
                                        <span className="text-xs text-[#64748B] mt-1">{b.department && <>Dept: <span className="font-semibold">{b.department}</span></>}</span>
                                        <span className="text-xs text-[#64748B] mt-1">{b.contactEmail && <>Email: <span className="font-semibold">{b.contactEmail}</span></>}</span>
                                        <span className="text-xs text-[#64748B] mt-1">{b.expectedAttendees && <>Attendees: <span className="font-semibold">{b.expectedAttendees}</span></>}</span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        {b.status === 'PENDING' && (
                                            <button
                                                onClick={() => { setEditingBooking(b); setIsModalOpen(true); }}
                                                className="text-[#4F46E5] hover:bg-[#EEF2FF] p-2 rounded-full transition-colors"
                                                title="Edit Booking"
                                            >
                                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                                            </button>
                                        )}
                                        {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                                            <button onClick={() => handleCancelBooking(b.id)} className="text-[#EF4444] hover:bg-[#FEF2F2] p-2 rounded-full transition-colors" title="Cancel Booking">
                                                <XCircle size={22} />
                                            </button>
                                        )}
                                        <button onClick={() => handleShowHistory(b.id)} className="text-[#4F46E5] hover:bg-[#EEF2FF] p-2 rounded-full transition-colors" title="View History">
                                            <FileText size={22} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 px-5 pb-5">
                                    <div className="flex items-center gap-2 text-[14px] text-[#4F46E5] font-medium">
                                        <Calendar size={16} />
                                        {b.bookingDate ? format(parseISO(b.bookingDate), 'MMM d, yyyy') : 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-2 text-[14px] text-[#4F46E5] font-medium">
                                        <Clock size={16} />
                                        {b.startTime.slice(0, 5)} - {b.endTime.slice(0, 5)}
                                    </div>
                                    {b.specialRequirements && (
                                        <div className="text-xs text-[#6366F1] mt-1"><span className="font-semibold">Special:</span> {b.specialRequirements}</div>
                                    )}
                                </div>
                                {b.status === 'REJECTED' && b.rejectionReason && (
                                    <div className="mx-5 mb-5 mt-[-8px] text-xs bg-[#FEF2F2] text-[#EF4444] p-3 rounded-xl border border-[#FCA5A5]">
                                        <span className="font-bold uppercase tracking-wider mb-1 text-[10px]">Rejection Reason</span>
                                        <span className="block mt-1">{b.rejectionReason}</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <BookingModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditingBooking(null); }}
                    onSubmit={handleSubmitBooking}
                    initialData={editingBooking}
                    prefillResourceId={resourceIdFromUrl || ''}
                />

                <BookingHistoryModal
                    isOpen={historyModalOpen}
                    onClose={() => setHistoryModalOpen(false)}
                    history={historyData}
                />
            </main>
        </div>
    );
}

export default BookingDashboard;
