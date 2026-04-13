import React, { useEffect, useState } from "react";
import axios from "axios";

// List all feedback for a resource
const FeedbackList = ({ resourceId }) => {
  const [feedback, setFeedback] = useState([]);
  const [averageRating, setAverageRating] = useState(null);

  const fetchFeedback = async () => {
    try {
      const res = await axios.get(`/api/feedback/${resourceId}`);
      // Defensive: ensure feedback is always an array
      const fb = Array.isArray(res.data.feedback) ? res.data.feedback : [];
      setFeedback(fb);
      setAverageRating(res.data.averageRating);
    } catch {
      setFeedback([]);
      setAverageRating(null);
    }
  };

  useEffect(() => {
    fetchFeedback();
    // eslint-disable-next-line
  }, [resourceId]);

  // Only show the latest 2 feedbacks
  const showFeedback = Array.isArray(feedback) ? feedback.slice(0, 2) : [];

  return (
    <div className="feedback-list" style={{
      marginTop: 24,
      marginBottom: 8,
      maxWidth: '100%',
      boxSizing: 'border-box',
      maxHeight: 220,
      overflowY: 'auto',
      paddingRight: 8
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff' }}>Feedback</h3>
        {typeof averageRating === "number" && !isNaN(averageRating) && (
          <span style={{ fontSize: 15, color: '#fbbf24', fontWeight: 600, background: 'rgba(251,191,36,0.08)', borderRadius: 8, padding: '2px 10px' }}>
            ★ {averageRating.toFixed(2)} / 5
          </span>
        )}
      </div>
      {showFeedback.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: 15, margin: '12px 0' }}>No feedback yet.</p>
      ) : (
        <ul style={{ padding: 0, margin: 0, listStyle: 'none', maxWidth: '100%' }}>
          {showFeedback.map(fb => (
            <li key={fb.feedbackId} style={{
              background: 'rgba(36,41,47,0.7)',
              borderRadius: 10,
              marginBottom: 16,
              padding: '14px 18px',
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
              border: '1px solid #23272f',
              color: '#e5e7eb',
              maxWidth: '100%',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              boxSizing: 'border-box',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: '#fbbf24', fontWeight: 600, fontSize: 16 }}>★ {fb.rating} / 5</span>
                <span style={{ fontSize: 13, color: '#888', marginLeft: 'auto' }}>{new Date(fb.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 15, color: '#fff', marginBottom: 2 }}>{fb.comment}</div>
            </li>
          ))}
        </ul>
      )}
      {Array.isArray(feedback) && feedback.length > 2 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <button
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px 0 rgba(37,99,235,0.08)' }}
            onClick={() => window.location.href = `/feedbacks/${resourceId}`}
          >
            View More
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
