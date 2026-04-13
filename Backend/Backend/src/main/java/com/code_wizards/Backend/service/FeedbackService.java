package com.code_wizards.Backend.service;

import com.code_wizards.Backend.dto.request.FeedbackRequest;
import com.code_wizards.Backend.entity.Feedback;
import java.util.List;

public interface FeedbackService {
    Feedback addFeedback(FeedbackRequest request);
    List<Feedback> getFeedbackByResource(Long resourceId);
    Double getAverageRating(Long resourceId);
}
