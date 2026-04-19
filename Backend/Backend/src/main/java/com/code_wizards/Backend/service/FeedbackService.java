package com.code_wizards.Backend.service;

import com.code_wizards.Backend.dto.request.FeedbackRequest;
import com.code_wizards.Backend.dto.response.FeedbackResponse;
import com.code_wizards.Backend.entity.Feedback;
import java.util.List;

public interface FeedbackService {
    FeedbackResponse addFeedback(FeedbackRequest request);
    List<FeedbackResponse> getFeedbackByResource(Long resourceId);
    Double getAverageRating(Long resourceId);
    List<FeedbackResponse> getAllFeedback();
    void deleteFeedback(Long feedbackId);
}
