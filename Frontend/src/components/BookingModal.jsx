import React, { useState } from 'react';
import { X, Calendar, Clock, Users, FileText } from 'lucide-react';

// Availability checker helper
const checkAvailability = async (resourceId, bookingDate, startTime, endTime) => {
    const response = await axios.get('http://localhost:8080/api/bookings/availability', {
        params: { resourceId, date: bookingDate, startTime, endTime }
    });
    return response.data.available;
};

export default function BookingModal({ isOpen, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        resourceId: '',
        bookingDate: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: '',
        contactEmail: '',
        department: '',
        specialRequirements: ''
    });

        // Availability state
    const [availability, setAvailability] = useState(null); // null | true | false
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    // Error message from backend
    const [error, setError] = useState('');

    // Prefill form when editing
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                resourceId: initialData.resourceId || '',
                bookingDate: initialData.bookingDate || '',
                startTime: initialData.startTime || '',
                endTime: initialData.endTime || '',
                purpose: initialData.purpose || '',
                expectedAttendees: initialData.expectedAttendees || '',
                contactEmail: initialData.contactEmail || '',
                department: initialData.department || '',
                specialRequirements: initialData.specialRequirements || ''
            });
        } else if (isOpen && !initialData) {
            setFormData({
                resourceId: '',
                bookingDate: '',
                startTime: '',
                endTime: '',
                purpose: '',
                expectedAttendees: '',
                contactEmail: '',
                department: '',
                specialRequirements: ''
            });
        }

        // Reset availability and error when modal opens/closes
        setAvailability(null);
        setError('');
    }, [isOpen, initialData]);

    useEffect(() => {
        const { resourceId, bookingDate, startTime, endTime } = formData;

        // Only check if all four fields are filled and it's a new booking (not edit)
        if (!resourceId || !bookingDate || !startTime || !endTime || initialData) {
            setAvailability(null);
            return;
        }

        // Don't check if end time is before or equal to start time
        if (endTime <= startTime) {
            setAvailability(null);
            return;
        }

        const timer = setTimeout(async () => {
            setCheckingAvailability(true);
            try {
                const available = await checkAvailability(resourceId, bookingDate, startTime, endTime);
                setAvailability(available);
            } catch {
                setAvailability(null); // silently fail — don't block the form
            } finally {
                setCheckingAvailability(false);
            }
        }, 500);

        return () => clearTimeout(timer); // cleanup on re-render
    }, [formData.resourceId, formData.bookingDate, formData.startTime, formData.endTime]);

    if (!isOpen) return null;

     const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Block submission if slot is taken (only for new bookings)
        if (!initialData && availability === false) return;
        try {
            // onSubmit can be async and may throw error (e.g., from backend)
            await onSubmit(formData);
        } catch (err) {
            // Show a friendly message for booking conflict
            if (
                err?.response?.status === 400 &&
                err?.response?.data?.error === 'Time slot conflicts with an existing booking.'
            ) {
                setError('This resource is already booked for the selected time slot. Please choose a different time.');
            } else {
                // Try to extract error message
                let msg = 'An error occurred.';
                if (err?.response?.data?.message) {
                    msg = err.response.data.message;
                } else if (typeof err === 'string') {
                    msg = err;
                } else if (err?.message) {
                    msg = err.message;
                }
                setError(msg);
            }
        }
    };


    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-indigo-600">New Booking</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded-full p-1.5 shadow-sm border border-transparent hover:border-red-100">
                        <X size={22} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Resource / Room</label>
                            <div className="relative">
                                <input required type="text" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. Conference Room A" value={formData.resourceId} onChange={e => setFormData({ ...formData, resourceId: e.target.value })} />
                                <FileText className="absolute left-3.5 top-3 text-gray-400" size={18} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Email</label>
                            <div className="relative">
                                <input required type="email" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. user@university.edu" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
                                <svg className="absolute left-3.5 top-3 text-gray-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="16" height="12" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
                            <select required className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                <option value="">Select department</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Business">Business</option>
                                <option value="Sciences">Sciences</option>
                                <option value="Arts">Arts</option>
                                <option value="Law">Law</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
                            <div className="relative">
                                <input required type="date" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" value={formData.bookingDate} onChange={e => setFormData({ ...formData, bookingDate: e.target.value })} />
                                <Calendar className="absolute left-3.5 top-3 text-gray-400" size={18} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Time</label>
                            <div className="relative">
                                <input required type="time" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                                <Clock className="absolute left-3.5 top-3 text-gray-400" size={18} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Time</label>
                            <div className="relative">
                                <input required type="time" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                                <Clock className="absolute left-3.5 top-3 text-gray-400" size={18} />
                            </div>
                        </div>
                    </div>

                    {!initialData && (
                        <div className="flex items-center gap-2 -mt-2 min-h-[24px]">
                            {checkingAvailability && (
                                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                                    Checking availability...
                                </span>
                            )}
                            {!checkingAvailability && availability === true && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2 7 5 10 11 4"/></svg>
                                    Slot available
                                </span>
                            )}
                            {!checkingAvailability && availability === false && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-500 border border-red-200">
                                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="2" y1="2" x2="11" y2="11"/><line x1="11" y1="2" x2="2" y2="11"/></svg>
                                    Slot taken — choose another time
                                </span>
                            )}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Attendees</label>
                            <div className="relative">
                                <input required type="number" min="1" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="e.g. 10" value={formData.expectedAttendees} onChange={e => setFormData({ ...formData, expectedAttendees: e.target.value })} />
                                <Users className="absolute left-3.5 top-3 text-gray-400" size={18} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Purpose</label>
                            <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Meeting purpose" value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Special Requirements</label>
                        <textarea className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none min-h-[48px] resize-y" placeholder="e.g. Projector, wheelchair access, etc." value={formData.specialRequirements} onChange={e => setFormData({ ...formData, specialRequirements: e.target.value })} />
                    </div>

                    {error && (
                        <div className="mb-2 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}
                    <div className="pt-4 flex gap-3">
                         <button
                            type="submit"
                            disabled={!initialData && availability === false}
                            className={`flex-1 py-3 rounded-xl font-semibold transition-all shadow-md
                                ${!initialData && availability === false
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
                                }`}
                        >
                            {initialData ? 'Update Booking' : 'Submit Request'}
                        </button>
                        <button type="button" onClick={onClose} className="flex-1 bg-white text-gray-700 border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
