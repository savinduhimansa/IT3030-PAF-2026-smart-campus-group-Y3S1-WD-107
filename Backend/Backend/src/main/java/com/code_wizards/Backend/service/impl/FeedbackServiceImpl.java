package com.code_wizards.Backend.service.impl;

import com.code_wizards.Backend.dto.request.FeedbackRequest;
import com.code_wizards.Backend.entity.Feedback;
import com.code_wizards.Backend.entity.Resource;
import com.code_wizards.Backend.repository.FeedbackRepository;
import com.code_wizards.Backend.repository.ResourceRepository;
import com.code_wizards.Backend.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Override
    public Feedback addFeedback(FeedbackRequest request) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        Feedback feedback = new Feedback();
        feedback.setResource(resource);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        feedback.setCreatedAt(LocalDateTime.now());

        return feedbackRepository.save(feedback);
    }

    @Override
    public List<Feedback> getFeedbackByResource(Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        return feedbackRepository.findByResource(resource);
    }

    @Override
    public Double getAverageRating(Long resourceId) {
        List<Feedback> feedbackList = getFeedbackByResource(resourceId);
        if (feedbackList.isEmpty()) return null;
        return feedbackList.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);
    }
}
