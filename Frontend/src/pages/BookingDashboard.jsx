import React, { useState, useEffect } from 'react';
import { Clock, XCircle, CheckCircle, FileText, User, Filter } from 'lucide-react';
import { getAllBookings, approveBooking, rejectBooking, resourceApi } from '../services/api';
import { format, parseISO } from 'date-fns';
import { RESOURCE_TYPES } from '../constants';

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

export default function AdminDashboard({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterResourceType, setFilterResourceType] = useState('ALL');
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [resourceIndex, setResourceIndex] = useState({});
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

  const EQUIPMENT_TYPES = new Set(['PROJECTOR', 'CAMERA', 'EQUIPMENT']);
  const isEquipmentType = (type) => EQUIPMENT_TYPES.has(type);

  const fetchResources = async () => {
    try {
      const res = await resourceApi.getAll();
      const list = Array.isArray(res.data) ? res.data : [];
      const index = {};
      list.forEach((r) => {
        if (r?.resourceId !== null && r?.resourceId !== undefined) {
          index[r.resourceId] = r;
        }
      });
      setResourceIndex(index);
    } catch {
      // Non-blocking: bookings can still render with resourceId fallback
      setResourceIndex({});
    } finally {
      setResourcesLoaded(true);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      // Check if user is logged in
      if (!user || !user.id) {
        setError('User not authenticated');
        setBookings([]);
        return;
      }

      const data = await getAllBookings(user.id, user?.role || 'USER', filterStatus === 'ALL' ? null : filterStatus);
      setBookings(Array.isArray(data) ? data : []);
    } catch (_err) {
      setError('Failed to fetch bookings.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, [filterStatus]);

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line
  }, []);

  // Stat counts
  const filteredBookings = filterResourceType === 'ALL' || !resourcesLoaded
    ? bookings
    : bookings.filter((b) => resourceIndex?.[b?.resourceId]?.type === filterResourceType);

  const attendeeQtyHeader = (() => {
    if (filterResourceType === 'ALL') return 'Attendees / Qty';
    return isEquipmentType(filterResourceType) ? 'Quantity' : 'Attendees';
  })();

  const total = filteredBookings.length;
  const pending = filteredBookings.filter(b => b.status === 'PENDING').length;
  const approved = filteredBookings.filter(b => b.status === 'APPROVED').length;
  const rejected = filteredBookings.filter(b => b.status === 'REJECTED').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-[28px] font-bold text-[#0F172A]">Admin Console</h1>
        <span className="text-[14px] text-[#64748B] font-medium">Review and manage all campus bookings</span>
      </div>
      {/* Stat summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total" value={total} color="#4F46E5" icon={<FileText size={22} />} />
        <StatCard label="Pending" value={pending} color="#F59E0B" icon={<Clock size={22} />} />
        <StatCard label="Approved" value={approved} color="#10B981" icon={<CheckCircle size={22} />} />
        <StatCard label="Rejected" value={rejected} color="#EF4444" icon={<XCircle size={22} />} />
      </div>
      
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4 mb-8 bg-white rounded-xl shadow px-6 py-4 border border-[#E2E8F0]" style={{borderRadius: 12}}>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[#4F46E5]" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] font-medium text-[#0F172A] focus:ring-2 focus:ring-[#4F46E5] outline-none"
            style={{minWidth: 140}}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterResourceType}
            onChange={e => setFilterResourceType(e.target.value)}
            disabled={!resourcesLoaded}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] font-medium text-[#0F172A] focus:ring-2 focus:ring-[#4F46E5] outline-none disabled:opacity-60"
            style={{minWidth: 180}}
          >
            <option value="ALL">All Resource Types</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm text-sm font-medium animate-pulse mb-6">{error}</div>}
      {/* Table */}
      <div
        className="bg-white rounded-xl shadow overflow-x-scroll overflow-y-hidden border border-[#E2E8F0] relative w-full max-w-full pb-2"
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
          WebkitOverflowScrolling: 'touch',
          scrollbarGutter: 'stable',
        }}
      >
        <table className="w-full min-w-max text-left text-[14px] whitespace-nowrap">
          <thead className="bg-[#F8FAFC] text-[#64748B] font-bold border-b border-[#E2E8F0] uppercase text-[11px] tracking-widest">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Resource</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Special Reqs</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">{attendeeQtyHeader}</th>
              <th className="px-6 py-4 text-right min-w-[240px] sticky right-0 z-20 bg-[#F8FAFC] border-l border-[#E2E8F0]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-16 text-center text-[#64748B]">
                  <div className="animate-pulse flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">Loading bookings...</span>
                  </div>
                </td>
              </tr>
            ) : filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-20 text-center text-[#64748B]">
                  <div className="flex flex-col items-center gap-3">
                    <FileText size={40} className="text-[#E2E8F0]" />
                    <span className="text-base font-medium">No bookings match the selected filter.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBookings.map(b => {
                // Status badge color mapping
                const statusMap = {
                  PENDING: { bg: '#FFFBEB', color: '#F59E0B', text: '#F59E0B' },
                  APPROVED: { bg: '#ECFDF5', color: '#10B981', text: '#10B981' },
                  REJECTED: { bg: '#FEF2F2', color: '#EF4444', text: '#EF4444' },
                  CANCELLED: { bg: '#F1F5F9', color: '#64748B', text: '#64748B' },
                };

                const toValidDate = (raw) => {
                  if (!raw) return null;
                  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw;
                  if (typeof raw === 'string') {
                    try {
                      const parsedIso = parseISO(raw);
                      if (!Number.isNaN(parsedIso.getTime())) return parsedIso;
                    } catch {
                      // fall through
                    }
                    const parsed = new Date(raw);
                    return Number.isNaN(parsed.getTime()) ? null : parsed;
                  }
                  const parsed = new Date(raw);
                  return Number.isNaN(parsed.getTime()) ? null : parsed;
                };

                const formatTimeLabel = (raw) => {
                  if (!raw) return '—';
                  if (typeof raw === 'string') {
                    // If it's already HH:mm or HH:mm:ss
                    if (/^\d{2}:\d{2}/.test(raw)) return raw.slice(0, 5);
                    // Spring LocalDateTime typically comes as ISO string
                    const date = toValidDate(raw);
                    if (date) return format(date, 'HH:mm');
                    return '—';
                  }
                  const date = toValidDate(raw);
                  return date ? format(date, 'HH:mm') : '—';
                };

                const bookingDateLabel = (() => {
                  // Backend Booking entity exposes startTime/endTime (LocalDateTime). bookingDate may not exist.
                  const raw = b?.bookingDate ?? b?.startTime ?? b?.endTime;
                  const date = toValidDate(raw);
                  return date ? format(date, 'MMM d, yyyy') : '—';
                })();

                const startTimeLabel = formatTimeLabel(b?.startTime);
                const endTimeLabel = formatTimeLabel(b?.endTime);

                const resource = resourceIndex?.[b?.resourceId];
                const resourceName = resource?.name || (b?.resourceId ? `Resource #${b.resourceId}` : 'Resource');
                const specialReqs = b?.specialRequirements || b?.specialReqs;

                const resolvedType = resource?.type;
                const showQuantity = isEquipmentType(resolvedType) || (filterResourceType !== 'ALL' && isEquipmentType(filterResourceType));
                const attendeeQtyLabel = showQuantity
                  ? `${b?.quantity ?? '—'} qty`
                  : `${b?.expectedAttendees ?? '—'} pax`;

                return (
                  <tr key={b.id} className="transition-colors group" style={{background: b.status === 'REJECTED' ? '#FEF2F2' : undefined}}>
                    <td className="px-6 py-5">
                      <span className="inline-block px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[11px]"
                        style={{
                          background: statusMap[b.status]?.bg,
                          color: statusMap[b.status]?.text,
                          borderRadius: 20,
                          fontWeight: 600
                        }}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-[#0F172A]">{resourceName}</div>
                    </td>
                    <td className="px-6 py-5 text-[#64748B] font-medium">
                      <span className="bg-[#F8FAFC] px-2.5 py-1 rounded-md border border-[#E2E8F0]">{b.department || '—'}</span>
                    </td>
                    <td className="px-6 py-5 text-[#64748B] font-medium max-w-[240px]">
                      <span className="bg-[#F8FAFC] px-2.5 py-1 rounded-md border border-[#E2E8F0] inline-block truncate max-w-[220px]" title={specialReqs || ''}>
                        {specialReqs || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[#64748B] font-medium bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] w-fit">
                        <User size={14} className="text-[#4F46E5]" /> {b.userId}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[#0F172A] font-semibold">{bookingDateLabel}</div>
                      <div className="text-[#64748B] text-xs mt-1 font-medium">{startTimeLabel} <span className="text-[#E2E8F0] mx-0.5">→</span> {endTimeLabel}</div>
                    </td>
                    <td className="px-6 py-5 text-[#64748B] font-medium">
                      <span className="bg-[#F8FAFC] px-2.5 py-1 rounded-md border border-[#E2E8F0]">{attendeeQtyLabel}</span>
                    </td>
                    <td
                      className="px-6 py-5 text-right min-w-[240px] sticky right-0 z-10 border-l border-[#E2E8F0] relative"
                      style={{ background: b.status === 'REJECTED' ? '#FEF2F2' : '#FFFFFF' }}
                    >
                      {b.status === 'PENDING' && rejectId !== b.id && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setError('');
                              approveBooking(user.role, user.id, b.id).then(fetchBookings).catch(err => setError(err.response?.data?.error || 'Failed to approve booking.'));
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#10B981] border border-[#10B981] bg-white hover:bg-[#ECFDF5] rounded-lg transition-colors shadow-sm"
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button
                            onClick={() => { setRejectId(b.id); setRejectReason(''); setError(''); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#EF4444] border border-[#EF4444] bg-white hover:bg-[#FEF2F2] rounded-lg transition-colors shadow-sm"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      )}
                      {rejectId === b.id && (
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                            setError('');
                            rejectBooking(user.role, user.id, rejectId, rejectReason)
                              .then(() => { setRejectId(null); setRejectReason(''); fetchBookings(); })
                              .catch(err => setError(err.response?.data?.error || 'Failed to reject booking.'));
                          }}
                          className="flex flex-col items-end gap-3 bg-white p-3 rounded-xl border border-[#FCA5A5] shadow-lg absolute right-0 mt-[-40px] z-10 animate-in fade-in zoom-in-95 duration-200" style={{minWidth: 220}}
                        >
                          <input
                            type="text"
                            required
                            autoFocus
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            className="text-sm border border-[#FCA5A5] bg-[#FEF2F2] focus:bg-white focus:ring-1 focus:ring-[#EF4444] px-3 py-2 rounded-lg outline-none w-full text-[#0F172A] transition-colors"
                          />
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setRejectId(null)} className="text-xs font-semibold px-3 py-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-md transition-colors">Cancel</button>
                            <button type="submit" className="text-xs font-semibold px-4 py-1.5 bg-[#EF4444] text-white rounded-md hover:bg-[#B91C1C] shadow-sm transition-colors transform hover:-translate-y-0.5">Confirm</button>
                          </div>
                        </form>
                      )}
                      {b.rejectionReason && b.status === 'REJECTED' && (
                        <div className="text-[11px] text-[#EF4444] bg-[#FEF2F2] px-2 py-1 rounded border border-[#FCA5A5] inline-block truncate max-w-[150px] mt-2" title={b.rejectionReason}>
                          Reason: {b.rejectionReason}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}