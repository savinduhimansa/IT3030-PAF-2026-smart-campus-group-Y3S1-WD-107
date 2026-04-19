import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Calendar, Clock, Users, FileText } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const getTodayLocalISODate = () => {
    const now = new Date();
    const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const localMidnightISO = new Date(localMidnight.getTime() - localMidnight.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
    return localMidnightISO;
};

// Availability checker helper
const checkAvailability = async (resourceId, bookingDate, startTime, endTime) => {
    const response = await axios.get(`${API_BASE}/bookings/availability`, {
        params: { resourceId, date: bookingDate, startTime, endTime }
    });
    return response.data.available;
};

// Fetch all approved booked slots for a resource on a given date
const fetchBookedSlots = async (resourceId, date) => {
    const response = await axios.get(`${API_BASE}/bookings/booked-slots`, {
        params: { resourceId, date }
    });
    return response.data; // [{ startTime, endTime, purpose }]
};

export default function BookingModal({ isOpen, onClose, onSubmit, initialData, prefillResource }) {
    const todayISODate = getTodayLocalISODate();

    const [formData, setFormData] = useState({
        resourceId: '',
        bookingDate: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: '',
        contactEmail: '',
        department: '',
        specialRequirements: '',
        quantity: 1,
    });

        // Availability state
    const [availability, setAvailability] = useState(null); // null | true | false
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Error message from backend
    const [error, setError] = useState('');

    // Prefill form when editing
    useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            setFormData({
                resourceId: initialData.resourceId || '',
                bookingDate: initialData.bookingDate || '',
                startTime: initialData.startTime || '',
                endTime: initialData.endTime || '',
                purpose: initialData.purpose || '',
                expectedAttendees: initialData.expectedAttendees || '',
                contactEmail: initialData.contactEmail || '',
                department: initialData.department || '',
                specialRequirements: initialData.specialRequirements || '',
                quantity: initialData.quantity || 1,
            });
        } else {
            setFormData({
                resourceId: prefillResource?.resourceId ?? '',
                bookingDate: '',
                startTime: '',
                endTime: '',
                purpose: '',
                expectedAttendees: '',
                contactEmail: '',
                department: '',
                specialRequirements: '',
                quantity: 1,
            });
        }

        // Reset availability and error when modal opens
        setAvailability(null);
        setError('');
    }, [isOpen, initialData, prefillResource]);

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

    // Fetch booked slots whenever resource or date changes
    useEffect(() => {
        const { resourceId, bookingDate } = formData;

        if (!resourceId || !bookingDate) {
            setBookedSlots([]);
            return;
        }

        setLoadingSlots(true);
        fetchBookedSlots(resourceId, bookingDate)
            .then(slots => setBookedSlots(slots))
            .catch(() => setBookedSlots([]))
            .finally(() => setLoadingSlots(false));

    }, [formData.resourceId, formData.bookingDate]);

    if (!isOpen) return null;

    // Determine resource category for dynamic fields
    const resourceType = prefillResource?.type || null;

    // Space-type: needs attendees
    const isSpaceType = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM'].includes(resourceType);

    // Equipment-type: needs quantity, no attendees
    const isEquipmentType = ['PROJECTOR', 'CAMERA', 'EQUIPMENT'].includes(resourceType);

    // Session type options per resource type
    const sessionTypeOptions = {
        LECTURE_HALL: ['Lecture', 'Exam', 'Workshop', 'Presentation', 'Other'],
        LAB: ['Practical', 'Exam', 'Training', 'Research', 'Other'],
        MEETING_ROOM: ['Team Meeting', 'Interview', 'External Meeting', 'Presentation', 'Other'],
        PROJECTOR: ['Lecture', 'Presentation', 'Event', 'Screening', 'Other'],
        CAMERA: ['Project', 'Event', 'Research', 'Media Production', 'Other'],
        EQUIPMENT: ['Project', 'Event', 'Research', 'Other'],
    };
    const sessionOptions = sessionTypeOptions[resourceType] || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Block submission if slot is taken (only for new bookings)
        if (!initialData && availability === false) return;
        try {
            // Prepare data with correct types and ISO datetime
            const {
                resourceId,
                bookingDate,
                startTime,
                endTime,
                purpose,
                expectedAttendees,
                contactEmail,
                department,
                specialRequirements,
                quantity,
            } = formData;

            if (bookingDate && bookingDate < todayISODate) {
                setError('Please select today or a future date.');
                return;
            }

            // Compose ISO 8601 datetime strings
            const startDateTime = bookingDate && startTime ? `${bookingDate}T${startTime}` : null;
            const endDateTime = bookingDate && endTime ? `${bookingDate}T${endTime}` : null;

            const shouldCollectAttendees = isSpaceType || !resourceType;

            const submitData = {
                resourceId: resourceId ? Number(resourceId) : null,
                startTime: startDateTime,
                endTime: endDateTime,
                purpose,
                expectedAttendees: shouldCollectAttendees ? (expectedAttendees ? Number(expectedAttendees) : 0) : 0,
                contactEmail,
                department,
                specialReqs: specialRequirements,
                quantity: isEquipmentType ? Number(quantity) : null,
            };

            await onSubmit(submitData);
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
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] z-[200] transition-opacity overflow-y-auto">
            <div className="min-h-full flex items-start justify-center p-4 py-8">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-hidden transform transition-all flex flex-col">
                    <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-indigo-600">
                            {prefillResource ? `Book: ${prefillResource.name}` : 'New Booking'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded-full p-1.5 shadow-sm border border-transparent hover:border-red-100">
                            <X size={22} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">

                        {/* Row 1: Resource ID (read-only if pre-filled) + Contact Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Resource / Room
                                </label>
                                <div className="relative">
                                    <input
                                        required
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-900"
                                        placeholder="e.g. Conference Room A"
                                        value={formData.resourceId}
                                        readOnly={!!prefillResource}
                                        onChange={e => setFormData({ ...formData, resourceId: e.target.value })}
                                    />
                                    <FileText className="absolute left-3.5 top-3 text-gray-400" size={18} />
                                </div>
                                {prefillResource && (
                                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                        {prefillResource.type?.replace('_', ' ')}
                                    </span>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Email</label>
                                <div className="relative">
                                    <input required type="email" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-900" placeholder="e.g. user@university.edu" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
                                    <svg className="absolute left-3.5 top-3 text-gray-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="16" height="12" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Department + Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
                                <select required className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-900" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
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
                                    <input required type="date" min={todayISODate} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-900" value={formData.bookingDate} onChange={e => setFormData({ ...formData, bookingDate: e.target.value })} />
                                    <Calendar className="absolute left-3.5 top-3 text-gray-400" size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Start Time + End Time */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Time</label>
                                <div className="relative">
                                    <input required type="time" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-900" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                                    <Clock className="absolute left-3.5 top-3 text-gray-400" size={18} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Time</label>
                                <div className="relative">
                                    <input required type="time" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-900" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                                    <Clock className="absolute left-3.5 top-3 text-gray-400" size={18} />
                                </div>
                            </div>
                        </div>

                        {/* ── Visual Timeline: Booked Slots for Selected Date ── */}
                        {formData.bookingDate && formData.resourceId && (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                                    Booked slots on {new Date(formData.bookingDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </p>

                                {loadingSlots ? (
                                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                        <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                                            <path d="M12 2a10 10 0 0 1 10 10"/>
                                        </svg>
                                        Loading schedule...
                                    </p>
                                ) : bookedSlots.length === 0 ? (
                                    <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2 7 5 10 11 4"/></svg>
                                        No bookings yet — all slots available
                                    </p>
                                ) : (
                                    <>
                                        {/* Timeline bar: 8AM to 10PM */}
                                        <div className="relative h-8 rounded-lg bg-gray-200 overflow-hidden mb-3">
                                            {/* Hour markers */}
                                            {[8, 10, 12, 14, 16, 18, 20].map(hour => (
                                                <div
                                                    key={hour}
                                                    className="absolute top-0 bottom-0 w-px bg-gray-300 opacity-60"
                                                    style={{ left: `${((hour - 8) / 14) * 100}%` }}
                                                />
                                            ))}

                                            {/* Booked slots — red blocks */}
                                            {bookedSlots.map((slot, i) => {
                                                const toMinutes = (t) => {
                                                    const [h, m] = t.split(':').map(Number);
                                                    return h * 60 + m;
                                                };
                                                const dayStart = 8 * 60;  // 8AM
                                                const dayEnd = 22 * 60;   // 10PM
                                                const totalMinutes = dayEnd - dayStart;

                                                const slotStart = Math.max(toMinutes(slot.startTime), dayStart);
                                                const slotEnd = Math.min(toMinutes(slot.endTime), dayEnd);

                                                const left = ((slotStart - dayStart) / totalMinutes) * 100;
                                                const width = ((slotEnd - slotStart) / totalMinutes) * 100;

                                                return (
                                                    <div
                                                        key={i}
                                                        className="absolute top-0 bottom-0 bg-red-400 opacity-80 flex items-center justify-center group"
                                                        style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                                                        title={`${slot.startTime} – ${slot.endTime}${slot.purpose ? ': ' + slot.purpose : ''}`}
                                                    >
                                                        <span className="text-[9px] text-white font-bold truncate px-1 hidden group-hover:block">
                                                            {slot.startTime}–{slot.endTime}
                                                        </span>
                                                    </div>
                                                );
                                            })}

                                            {/* Selected slot — blue block (if user has filled start + end time) */}
                                            {formData.startTime && formData.endTime && formData.startTime < formData.endTime && (() => {
                                                const toMinutes = (t) => {
                                                    const [h, m] = t.split(':').map(Number);
                                                    return h * 60 + m;
                                                };
                                                const dayStart = 8 * 60;
                                                const dayEnd = 22 * 60;
                                                const totalMinutes = dayEnd - dayStart;
                                                const slotStart = Math.max(toMinutes(formData.startTime), dayStart);
                                                const slotEnd = Math.min(toMinutes(formData.endTime), dayEnd);
                                                const left = ((slotStart - dayStart) / totalMinutes) * 100;
                                                const width = ((slotEnd - slotStart) / totalMinutes) * 100;

                                                return (
                                                    <div
                                                        className="absolute top-0 bottom-0 bg-indigo-500 opacity-70 border-2 border-indigo-600"
                                                        style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                                                        title={`Your selection: ${formData.startTime}–${formData.endTime}`}
                                                    />
                                                );
                                            })()}
                                        </div>

                                        {/* Time labels below bar */}
                                        <div className="flex justify-between text-[10px] text-gray-400 mb-3">
                                            {['8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'].map(t => (
                                                <span key={t}>{t}</span>
                                            ))}
                                        </div>

                                        {/* Legend */}
                                        <div className="flex items-center gap-4 text-[11px] text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Booked
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> Your selection
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-3 h-3 rounded-sm bg-gray-200 inline-block" /> Available
                                            </span>
                                        </div>

                                        {/* List of booked slots below timeline */}
                                        <div className="mt-3 flex flex-col gap-1.5">
                                            {bookedSlots.map((slot, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                                                    <span className="font-semibold">{slot.startTime} – {slot.endTime}</span>
                                                    {slot.purpose && <span className="text-gray-400">· {slot.purpose}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Availability checker — keep exactly as is */}
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

                        {/* Row 4: DYNAMIC FIELDS based on resource type */}

                        {/* SPACE TYPES: Lecture Hall, Lab, Meeting Room → show Attendees + Session Type */}
                        {(isSpaceType || !resourceType) && (
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Expected Attendees
                                    </label>
                                    <div className="relative">
                                        <input
                                            required={isSpaceType || !resourceType}
                                            type="number"
                                            min="1"
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-900"
                                            placeholder="e.g. 30"
                                            value={formData.expectedAttendees}
                                            onChange={e => setFormData({ ...formData, expectedAttendees: e.target.value })}
                                        />
                                        <Users className="absolute left-3.5 top-3 text-gray-400" size={18} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Session Type
                                    </label>
                                    <select
                                        required={isSpaceType || !resourceType}
                                        className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-900"
                                        value={formData.purpose}
                                        onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                    >
                                        <option value="">Select session type</option>
                                        {sessionOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                        {!resourceType && (
                                            <>
                                                <option value="Lecture">Lecture</option>
                                                <option value="Meeting">Meeting</option>
                                                <option value="Exam">Exam</option>
                                                <option value="Workshop">Workshop</option>
                                                <option value="Other">Other</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* EQUIPMENT TYPES: Projector, Camera, Equipment → show Quantity + Purpose */}
                        {isEquipmentType && (
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Quantity Needed
                                    </label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-900"
                                            placeholder="e.g. 2"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                        />
                                        <Users className="absolute left-3.5 top-3 text-gray-400" size={18} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Purpose
                                    </label>
                                    <select
                                        required
                                        className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-900"
                                        value={formData.purpose}
                                        onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                    >
                                        <option value="">Select purpose</option>
                                        {sessionOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Special Requirements — shown for ALL types, always optional */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Special Requirements <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <textarea
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none min-h-[48px] resize-y text-gray-900"
                                placeholder={
                                    isEquipmentType
                                        ? 'e.g. Needs carrying case, specific lens required...'
                                        : 'e.g. Wheelchair access, whiteboard markers, specific seating layout...'
                                }
                                value={formData.specialRequirements}
                                onChange={e => setFormData({ ...formData, specialRequirements: e.target.value })}
                            />
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
        </div>
    );
}
