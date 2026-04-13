import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FeedbackForm from '../components/FeedbackForm';

export default function AddFeedback() {
  const { resourceId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="add-feedback-page" style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, color: '#222' }}>
      <h2>Add Feedback</h2>
      <FeedbackForm
        resourceId={resourceId}
        onFeedbackSubmitted={() => navigate(-1)}
      />
      <button onClick={() => navigate(-1)} style={{ marginTop: 16 }}>Cancel</button>
    </div>
  );
}
