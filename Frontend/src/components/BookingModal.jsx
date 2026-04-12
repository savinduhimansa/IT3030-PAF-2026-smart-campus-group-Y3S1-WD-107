import React, { useState } from 'react';
import { X, Calendar, Clock, Users, FileText } from 'lucide-react';

export default function BookingModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        resourceId: '',
        bookingDate: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: '',
        contactEmail: '',
        department: '',
        specialReqs: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
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
                    <div className="pt-4 flex gap-3">
                        <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                            Submit Request
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
