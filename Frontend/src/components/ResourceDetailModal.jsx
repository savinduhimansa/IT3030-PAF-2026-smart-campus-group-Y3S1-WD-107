import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, MapPin, Users, Clock, Shield, CheckCircle, XCircle, Activity } from 'lucide-react'
import { getTypeInfo, getStatusInfo, getUnitLabel } from '../constants'
import FeedbackList from './FeedbackList'
import FeedbackForm from './FeedbackForm'
import BookingModal from './BookingModal'
import AvailabilityTracker from './AvailabilityTracker'
import { createBooking } from '../services/api'

// Pass 'user' prop (null if not logged in)
export default function ResourceDetailModal({ resource, onClose, user }) {
  const navigate = useNavigate();
  const typeInfo = getTypeInfo(resource.type)
  const statusInfo = getStatusInfo(resource.status)
  const [feedbackRefresh, setFeedbackRefresh] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose} id="resource-detail-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          className="modal-banner"
          style={{
            background: `linear-gradient(90deg, ${typeInfo.color}, ${typeInfo.color}88, var(--accent-secondary))`,
          }}
        />

        <button className="modal-close" onClick={onClose} id="modal-close-btn">
          <X size={18} />
        </button>

        <div className="modal-body p-8">
          {/* Header Section */}
          <div className="mb-10">
            <h2 id="modal-resource-name" className="text-3xl font-black text-[#1E293B] mb-4 tracking-tight leading-tight">
              {resource.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border shadow-sm" style={{ background: `${typeInfo.color}15`, color: typeInfo.color, borderColor: `${typeInfo.color}30` }}>
                {typeInfo.icon} {typeInfo.label}
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border shadow-sm" style={{ background: `${statusInfo.color}15`, color: statusInfo.color, borderColor: `${statusInfo.color}30` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusInfo.color }} />
                {statusInfo.label}
              </span>
              {resource.isBookable ? (
                <span className="px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-green-200 bg-green-50 text-green-600 shadow-sm">
                  <CheckCircle size={14} /> Bookable
                </span>
              ) : (
                <span className="px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-red-200 bg-red-50 text-red-600 shadow-sm">
                  <XCircle size={14} /> Not Bookable
                </span>
              )}
            </div>
          </div>

          {/* Description Block */}
          <div className="mb-10 relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-100 rounded-full" />
            <p className="text-base text-[#475569] leading-relaxed italic font-medium px-2">
              {resource.description || 'No description provided for this campus resource.'}
            </p>
          </div>

          {/* Key Information Grid */}
          <div className="mb-12">
            <h4 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              Key Information
              <div className="flex-1 h-px bg-slate-100" />
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Location', val: resource.location, icon: <MapPin size={22} />, color: '#4F8CFF' },
                { label: 'Capacity', val: `${resource.capacity} ${getUnitLabel(resource.type, resource.capacity)}`, icon: <Users size={22} />, color: '#10B981' },
                { label: 'Status', val: statusInfo.label, icon: <Shield size={22} />, color: statusInfo.color },
                { label: 'Resource ID', val: `#${resource.resourceId}`, icon: <Clock size={22} />, color: '#8B5CF6' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-5 p-5 rounded-[24px] bg-slate-50/50 border border-slate-100 group hover:border-[#4F8CFF]/30 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500" style={{ background: `${item.color}15`, color: item.color }}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="text-[15px] font-bold text-[#1E293B] truncate">{item.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="mb-12">
            <h4 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              Operating Schedule
              <div className="flex-1 h-px bg-slate-100" />
            </h4>

            {resource.availableFrom && resource.availableTo ? (
              <div className="bg-[#1E293B] rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-[#1E293B]/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.2em]">Opens At</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Clock size={18} className="text-blue-400" /></div>
                      <span className="text-2xl font-black">{resource.availableFrom}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-pink-300 uppercase tracking-[0.2em]">Closes At</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Clock size={18} className="text-pink-400" /></div>
                      <span className="text-2xl font-black">{resource.availableTo}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-green-300 uppercase tracking-[0.2em]">Total Access</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Activity size={18} className="text-green-400" /></div>
                      <span className="text-2xl font-black">
                        {(() => {
                          try {
                            const fromParts = resource.availableFrom.split(':')
                            const toParts = resource.availableTo.split(':')
                            return `${parseInt(toParts[0]) - parseInt(fromParts[0])}h`
                          } catch { return '—' }
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 bg-red-50/50 rounded-[32px] border border-red-100 text-center text-red-600 font-bold italic">
                No active schedule defined for this resource
              </div>
            )}
          </div>

          {/* Feedback & Actions */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-lg font-black text-[#1E293B]">Community Insights</h4>
                <p className="text-xs text-[#94A3B8] font-bold">What others are saying about this facility</p>
              </div>
              <button
                className="px-5 py-2.5 bg-slate-50 text-[#1E293B] hover:bg-slate-100 text-sm font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-2"
                onClick={() => {
                  const storedUserId = localStorage.getItem('userId');
                  if (!storedUserId && !user?.id) {
                    window.dispatchEvent(new CustomEvent('show-toast', {
                      detail: { message: 'Please log in before proceeding.', type: 'error' }
                    }));
                    return;
                  }
                  onClose();
                  navigate(`/feedback/${resource.resourceId}`);
                }}
              >
                Share Experience
              </button>
            </div>

            <div className="max-h-[220px] overflow-y-auto pr-4 mb-4 custom-scrollbar">
              <FeedbackList resourceId={resource.resourceId} key={feedbackRefresh} />
            </div>

            {/* Resource Availability Tracker */}
            <div className="mt-12">
              <h4 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                Live Availability
                <div className="flex-1 h-px bg-slate-100" />
              </h4>
              <AvailabilityTracker
                resourceId={resource.resourceId}
                resourceName={resource.name}
                availableFrom={resource.availableFrom}
                availableTo={resource.availableTo}
              />
            </div>

            {/* Book Now Action */}
            {resource.isBookable && (
              <div className="flex justify-center pt-8 mt-4 border-t border-slate-100">
                <button
                  className="btn btn-primary px-12 py-4 text-base font-black shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
                  onClick={() => {
                    const storedUserId = localStorage.getItem('userId')
                    if (!storedUserId && !user?.id) {
                      localStorage.setItem('pendingResourceId', resource.resourceId)
                      onClose(); navigate('/login');
                      return
                    }
                    setIsBookingModalOpen(true)
                  }}
                  id="book-now-btn"
                >
                  Book Now
                </button>
              </div>
            )}
          </div>

          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            prefillResource={resource}
            onSubmit={async (payload) => {
              const resolvedUserId = user?.id ?? Number(localStorage.getItem('userId'))
              if (!resolvedUserId) {
                throw new Error('Please login to make a booking.')
              }
              await createBooking(resolvedUserId, payload)
              setIsBookingModalOpen(false)
              onClose()
            }}
          />
        </div>
      </div>
    </div>
  )
}
