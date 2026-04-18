import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, MapPin, Users, Clock, Shield, CheckCircle, XCircle } from 'lucide-react'
import { getTypeInfo, getStatusInfo } from '../constants'
import FeedbackList from './FeedbackList'
import FeedbackForm from './FeedbackForm'
import BookingModal from './BookingModal'
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

        <div className="modal-body">
          {/* Title & Type */}
          <h2 id="modal-resource-name">{resource.name}</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span
              className="modal-type-badge"
              style={{
                background: `${typeInfo.color}18`,
                color: typeInfo.color,
                border: `1px solid ${typeInfo.color}33`,
                marginBottom: 0,
              }}
            >
              {typeInfo.icon} {typeInfo.label}
            </span>
            <span
              className="modal-type-badge"
              style={{
                background: `${statusInfo.color}18`,
                color: statusInfo.color,
                border: `1px solid ${statusInfo.color}33`,
                marginBottom: 0,
              }}
            >
              ● {statusInfo.label}
            </span>
            {resource.isBookable ? (
              <span
                className="modal-type-badge"
                style={{
                  background: 'rgba(16,185,129,0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.3)',
                  marginBottom: 0,
                }}
              >
                <CheckCircle size={14} /> Bookable
              </span>
            ) : (
              <span
                className="modal-type-badge"
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.3)',
                  marginBottom: 0,
                }}
              >
                <XCircle size={14} /> Not Bookable
              </span>
            )}
          </div>

          {/* Description */}
          <p className="modal-description">
            {resource.description || 'No description provided for this resource.'}
          </p>

          {/* Key Info Grid */}
          <div className="modal-section">
            <h4>Key Information</h4>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <label>
                  <MapPin size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Location
                </label>
                <span>{resource.location}</span>
              </div>
              <div className="modal-info-item">
                <label>
                  <Users size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Capacity
                </label>
                <span>{resource.capacity} {resource.capacity === 1 ? 'unit' : 'seats'}</span>
              </div>
              <div className="modal-info-item">
                <label>
                  <Shield size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Status
                </label>
                <span style={{ color: statusInfo.color }}>{statusInfo.label}</span>
              </div>
              <div className="modal-info-item">
                <label>
                  <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Resource ID
                </label>
                <span>#{resource.resourceId}</span>
              </div>
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="modal-section">
            <h4>
              <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Availability Window
            </h4>
            {resource.availableFrom && resource.availableTo ? (
              <div style={{
                display: 'flex', gap: '16px', flexWrap: 'wrap',
              }}>
                <div className="modal-info-item" style={{ flex: 1, minWidth: '150px' }}>
                  <label>Available From</label>
                  <span className="time-badge">
                    <Clock size={12} />
                    {resource.availableFrom}
                  </span>
                </div>
                <div className="modal-info-item" style={{ flex: 1, minWidth: '150px' }}>
                  <label>Available To</label>
                  <span className="time-badge">
                    <Clock size={12} />
                    {resource.availableTo}
                  </span>
                </div>
                <div className="modal-info-item" style={{ flex: 1, minWidth: '150px' }}>
                  <label>Duration</label>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {(() => {
                      try {
                        const fromParts = resource.availableFrom.split(':')
                        const toParts = resource.availableTo.split(':')
                        const fromH = parseInt(fromParts[0])
                        const toH = parseInt(toParts[0])
                        return `${toH - fromH} hours`
                      } catch {
                        return '—'
                      }
                    })()}
                  </span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '20px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent-red)',
                  fontSize: '14px',
                  textAlign: 'center',
                }}
              >
                No availability window defined for this resource
              </div>
            )}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="modal-section" style={{ maxHeight: 140, overflowY: 'auto', marginBottom: 32, paddingRight: 8 }}>
          <FeedbackList resourceId={resource.resourceId} key={feedbackRefresh} />
          <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
            <button
              className="btn btn-accent"
              onClick={() => {
                onClose();
                navigate(`/feedback/${resource.resourceId}`);
              }}
              id="add-feedback-btn"
            >
              Add Feedback
            </button>
          </div>
        </div>

        {/* Book Now Button */}
        {resource.isBookable && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0 0 0' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                const storedUserId = localStorage.getItem('userId')
                if (!storedUserId && !user?.id) {
                  onClose()
                  navigate('/login')
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
  )
}
