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
    <div className="feedback-list">
      {showFeedback.length === 0 ? (
        <p className="text-[#94A3B8] text-sm italic py-4">No reviews shared for this facility yet.</p>
      ) : (
        <ul className="space-y-4 p-0 m-0 list-none">
          {showFeedback.map(fb => (
            <li key={fb.feedbackId} className="bg-slate-50 border border-slate-100 rounded-[20px] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#fbbf24] font-bold text-sm">★ {fb.rating} / 5</span>
                <span className="text-[10px] text-[#94A3B8] font-bold ml-auto uppercase tracking-wider">
                  {new Date(fb.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm text-[#334155] font-medium leading-relaxed">{fb.comment}</div>
            </li>
          ))}
        </ul>
      )}
      {Array.isArray(feedback) && feedback.length > 2 && (
        <div className="flex justify-center mt-6">
          <button
            className="px-6 py-2 bg-white border border-slate-200 text-[#1E293B] text-xs font-bold rounded-lg hover:bg-slate-50 transition-all"
            onClick={() => window.location.href = `/feedbacks/${resourceId}`}
          >
            Read All Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
