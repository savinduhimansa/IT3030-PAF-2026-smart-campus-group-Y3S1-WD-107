import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AllFeedbacks() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    axios.get(`/api/feedback/${resourceId}`).then(res => {
      setFeedback(Array.isArray(res.data.feedback) ? res.data.feedback : []);
      setAverageRating(res.data.averageRating);
    });
  }, [resourceId]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 30%, #23283a 0%, #181c24 100%)',
      padding: 0,
      margin: 0,
    }}>
      <div style={{
        maxWidth: 540,
        width: '100%',
        padding: '32px 24px',
        background: 'rgba(24,28,36,0.98)',
        borderRadius: 18,
        color: '#e5e7eb',
        boxShadow: '0 4px 32px 0 rgba(0,0,0,0.12)',
        border: '1px solid #23272f',
      }}>
      <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 8, color: '#fff' }}>All Feedbacks</h2>
      {typeof averageRating === 'number' && !isNaN(averageRating) && (
        <div style={{ marginBottom: 24, fontSize: 18, color: '#fbbf24', fontWeight: 600, background: 'rgba(251,191,36,0.08)', borderRadius: 8, padding: '6px 16px', display: 'inline-block' }}>
          ★ {averageRating.toFixed(2)} / 5
        </div>
      )}
      {feedback.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: 16, margin: '18px 0' }}>No feedback yet.</p>
      ) : (
        <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
          {feedback.map(fb => (
            <li key={fb.feedbackId} style={{
              background: 'rgba(36,41,47,0.85)',
              borderRadius: 12,
              marginBottom: 22,
              padding: '18px 22px',
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
              border: '1px solid #23272f',
              color: '#e5e7eb',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              boxSizing: 'border-box',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 18 }}>★ {fb.rating} / 5</span>
                <span style={{ fontSize: 13, color: '#888', marginLeft: 'auto' }}>{new Date(fb.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 16, color: '#fff', marginBottom: 2 }}>{fb.comment}</div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 28px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px 0 rgba(37,99,235,0.08)'
          }}
        >
          Back
        </button>
      </div>
      </div>
    </div>
  );
}
