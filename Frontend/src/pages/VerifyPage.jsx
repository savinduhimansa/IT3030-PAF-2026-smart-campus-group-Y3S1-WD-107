import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { verifyBooking } from '../services/api';

export default function VerifyPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const res = await verifyBooking(token);
        if (cancelled) return;
        setData(res);
      } catch (err) {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status === 404) {
          setData({ valid: false, reason: 'QR code not recognized' });
        } else {
          setData({ valid: false, reason: 'Unable to verify QR code' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const parsed = useMemo(() => {
    if (!data?.startTime || !data?.endTime) return null;
    try {
      const start = parseISO(data.startTime);
      const end = parseISO(data.endTime);
      return { start, end };
    } catch {
      return null;
    }
  }, [data]);

  const details = useMemo(() => {
    if (!data?.valid) return null;
    const resource = data?.resourceId != null ? `Resource #${data.resourceId}` : 'Resource';
    const date = parsed?.start ? format(parsed.start, 'MMM d, yyyy') : '—';
    const time = parsed?.start && parsed?.end
      ? `${format(parsed.start, 'h:mm a')} → ${format(parsed.end, 'h:mm a')}`
      : '—';
    return {
      resource,
      date,
      time,
      purpose: data?.purpose || '—',
      attendees: data?.expectedAttendees != null ? String(data.expectedAttendees) : '—',
    };
  }, [data, parsed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow p-8 border border-[#E2E8F0]" style={{ borderRadius: 16 }}>
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[#0F172A] font-semibold">Verifying check-in…</span>
          </div>
          <div className="mt-6 text-center text-xs text-[#64748B] font-medium">UniBook</div>
        </div>
      </div>
    );
  }

  const valid = Boolean(data?.valid);
  const reason = data?.reason || 'Invalid check-in';

  return (
    <div className={valid ? 'min-h-screen bg-[#ECFDF5]' : 'min-h-screen bg-[#FEF2F2]'}>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow p-8 border border-[#E2E8F0]" style={{ borderRadius: 16 }}>
          <div className="text-center">
            <div className={valid ? 'text-6xl' : 'text-6xl'}>{valid ? '✅' : '❌'}</div>
            <div className={valid ? 'mt-4 text-2xl font-extrabold text-[#065F46]' : 'mt-4 text-2xl font-extrabold text-[#991B1B]'}>
              {valid ? 'Valid Check-in' : 'Invalid Check-in'}
            </div>
            {!valid && (
              <div className="mt-3 text-sm font-semibold text-[#B91C1C]">{reason}</div>
            )}
          </div>

          {valid && details && (
            <div className="mt-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5" style={{ borderRadius: 12 }}>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B] font-semibold">Resource</span>
                  <span className="text-[#0F172A] font-bold text-right">{details.resource}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B] font-semibold">Date</span>
                  <span className="text-[#0F172A] font-bold text-right">{details.date}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B] font-semibold">Time</span>
                  <span className="text-[#0F172A] font-bold text-right">{details.time}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B] font-semibold">Purpose</span>
                  <span className="text-[#0F172A] font-bold text-right">{details.purpose}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B] font-semibold">Attendees</span>
                  <span className="text-[#0F172A] font-bold text-right">{details.attendees}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-7 text-center text-xs text-[#64748B] font-extrabold tracking-widest">UniBook</div>
        </div>
      </div>
    </div>
  );
}
