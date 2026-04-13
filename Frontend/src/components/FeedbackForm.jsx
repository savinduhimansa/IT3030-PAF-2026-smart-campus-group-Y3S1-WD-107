import React, { useState } from "react";
import axios from "axios";

// Feedback form for submitting feedback
const FeedbackForm = ({ resourceId, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/feedback", {
        resourceId,
        rating,
        comment,
      });
      setRating(5);
      setComment("");
      onFeedbackSubmitted && onFeedbackSubmitted(); // Refresh feedback list
    } catch (err) {
      alert("Failed to submit feedback.");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="feedback-form"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        background: 'var(--surface-card, #f9f9f9)',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)'
      }}
    >
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Add Feedback</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label htmlFor="rating" style={{ fontWeight: 500, fontSize: 16 }}>Rating:</label>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1, 2, 3, 4, 5].map(num => (
            <span
              key={num}
              style={{
                cursor: 'pointer',
                fontSize: 28,
                color: num <= rating ? '#fbbf24' : '#e5e7eb',
                transition: 'color 0.2s'
              }}
              onClick={() => setRating(num)}
              onMouseEnter={() => setRating(num)}
              onMouseLeave={() => setRating(rating)}
              role="button"
              aria-label={`Rate ${num} star${num > 1 ? 's' : ''}`}
              tabIndex={0}
            >
              ★
            </span>
          ))}
        </div>
        <span style={{ fontSize: 15, color: '#888' }}>{rating} / 5</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="comment" style={{ fontWeight: 500, fontSize: 16 }}>Comment:</label>
        <textarea
          id="comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={1000}
          required
          rows={4}
          style={{
            padding: 10,
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 15,
            resize: 'vertical',
            background: '#fff',
            color: '#222'
          }}
          placeholder="Share your experience or suggestions..."
        />
        <div style={{ fontSize: 12, color: '#888', alignSelf: 'flex-end' }}>{comment.length}/1000</div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'var(--accent-blue, #2563eb)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 22px',
            fontWeight: 600,
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'background 0.2s, opacity 0.2s'
          }}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
        <button
          type="button"
          onClick={() => {
            setRating(5);
            setComment("");
          }}
          style={{
            background: '#eee',
            color: '#333',
            border: 'none',
            borderRadius: 8,
            padding: '10px 22px',
            fontWeight: 500,
            fontSize: 16,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;
