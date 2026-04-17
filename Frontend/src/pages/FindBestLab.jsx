import React, { useState } from 'react';
import { resourceApi } from '../services/api';

const RESOURCE_TYPE_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Lecture Hall', value: 'LECTURE_HALL' },
  { label: 'Lab', value: 'LAB' },
  { label: 'Meeting Room', value: 'MEETING_ROOM' },
  { label: 'Projector', value: 'PROJECTOR' },
  { label: 'Camera', value: 'CAMERA' },
  { label: 'Equipment', value: 'EQUIPMENT' },
];

export default function FindBestLab() {
  const [minCapacity, setMinCapacity] = useState('');
  const [requiredTime, setRequiredTime] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');

  const rankResources = (resources, requestedType, requestedCapacity) => {
    const capacityNeed = Number(requestedCapacity);

    return [...resources]
      .filter((resource) => resource?.isBookable !== false)
      .sort((a, b) => {
        const aTypeMismatch = requestedType && a.type !== requestedType ? 1 : 0;
        const bTypeMismatch = requestedType && b.type !== requestedType ? 1 : 0;
        if (aTypeMismatch !== bTypeMismatch) return aTypeMismatch - bTypeMismatch;

        const aCapacityGap = Math.abs((a.capacity ?? 0) - capacityNeed);
        const bCapacityGap = Math.abs((b.capacity ?? 0) - capacityNeed);
        if (aCapacityGap !== bCapacityGap) return aCapacityGap - bCapacityGap;

        return (a.name || '').localeCompare(b.name || '');
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendations([]);

    const capacityValue = Number(minCapacity);
    if (!Number.isInteger(capacityValue) || capacityValue < 1) {
      setError('Minimum capacity must be a positive whole number.');
      setLoading(false);
      return;
    }

    try {
      const params = {
        minCapacity: capacityValue,
        availableFrom: requiredTime,
        availableTo: requiredTime,
        status: 'ACTIVE',
      };
      if (type) params.type = type;

      const res = await resourceApi.getAll(params);
      const ranked = rankResources(res.data || [], type, capacityValue);
      setRecommendations(ranked);
      if (ranked.length === 0) setError('No matching resource found.');
    } catch (err) {
      setError('Failed to fetch recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(1200px 500px at 20% -10%, #1b2a52 0%, rgba(27,42,82,0.2) 50%, transparent 70%), linear-gradient(180deg, #0b1220 0%, #0f172a 100%)',
        color: '#e5e7eb',
        padding: '48px 20px 80px',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', color: '#93c5fd', marginBottom: 10 }}>
            Smart Recommendation
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>
            Find the Best Lab for Your Session
          </h1>
          <p style={{ marginTop: 10, color: '#cbd5f5', maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
            Tell us your capacity and time window. We will score and recommend the most suitable resource.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 22,
          }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 13, color: '#cbd5f5' }}>Minimum Capacity</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={minCapacity}
                  onChange={e => setMinCapacity(e.target.value)}
                  className="input"
                  style={{ width: '100%', background: '#0b1220', color: '#e5e7eb', border: '1px solid #1e293b' }}
                />
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 13, color: '#cbd5f5' }}>Time</label>
                <input
                  type="time"
                  required
                  value={requiredTime}
                  onChange={e => setRequiredTime(e.target.value)}
                  className="input"
                  style={{ width: '100%', background: '#0b1220', color: '#e5e7eb', border: '1px solid #1e293b' }}
                />
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 13, color: '#cbd5f5' }}>Resource Type (optional)</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="input"
                  style={{ width: '100%', background: '#0b1220', color: '#e5e7eb', border: '1px solid #1e293b' }}
                >
                  {RESOURCE_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? 'Finding...' : 'Find Best Resource'}
              </button>
            </form>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 12,
                padding: 14,
                color: '#fecaca',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {recommendations.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: 20 }}>Recommended Resources</h2>
                <span style={{ color: '#93c5fd', fontSize: 13 }}>Top match highlighted</span>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                {recommendations.map((r, idx) => (
                  <div
                    key={r.resourceId}
                    style={{
                      border: idx === 0 ? '2px solid #10b981' : '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: 16,
                      padding: 18,
                      background: idx === 0 ? 'rgba(16,185,129,0.08)' : 'rgba(15, 23, 42, 0.7)',
                      boxShadow: idx === 0 ? '0 8px 24px rgba(16,185,129,0.12)' : '0 6px 16px rgba(0,0,0,0.18)',
                      position: 'relative',
                    }}
                  >
                    {idx === 0 && (
                      <span style={{
                        position: 'absolute',
                        top: 14,
                        right: 18,
                        background: '#10b981',
                        color: '#0b1220',
                        borderRadius: 999,
                        padding: '2px 10px',
                        fontWeight: 700,
                        fontSize: 12,
                        letterSpacing: 0.6,
                      }}>Recommended</span>
                    )}
                    <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>{r.name}</div>
                    <div style={{ color: '#94a3b8', marginBottom: 10 }}>Type: {r.type}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                      <div>Capacity: <b>{r.capacity}</b></div>
                      <div>Location: <b>{r.location}</b></div>
                      <div>Available: <b>{r.availableFrom} - {r.availableTo}</b></div>
                      <div>Status: <b>{r.status}</b></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
