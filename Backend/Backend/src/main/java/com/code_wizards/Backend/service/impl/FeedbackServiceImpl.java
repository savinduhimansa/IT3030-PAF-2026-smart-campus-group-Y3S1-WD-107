package com.code_wizards.Backend.service.impl;

import com.code_wizards.Backend.dto.request.FeedbackRequest;
import com.code_wizards.Backend.dto.response.FeedbackResponse;
import com.code_wizards.Backend.entity.Feedback;
import com.code_wizards.Backend.entity.Resource;
import com.code_wizards.Backend.repository.FeedbackRepository;
import com.code_wizards.Backend.repository.ResourceRepository;
import com.code_wizards.Backend.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Override
    public FeedbackResponse addFeedback(FeedbackRequest request) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        Feedback feedback = new Feedback();
        feedback.setResource(resource);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        feedback.setCreatedAt(LocalDateTime.now());

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return mapToResponse(savedFeedback);
    }

    @Override
    public List<FeedbackResponse> getFeedbackByResource(Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        return feedbackRepository.findByResource(resource).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Double getAverageRating(Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        List<Feedback> feedbackList = feedbackRepository.findByResource(resource);
        if (feedbackList.isEmpty()) return null;
        return feedbackList.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);
    }

    @Override
    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteFeedback(Long feedbackId) {
        feedbackRepository.deleteById(feedbackId);
    }

    private FeedbackResponse mapToResponse(Feedback feedback) {
        return new FeedbackResponse(
                feedback.getFeedbackId(),
                feedback.getResource().getResourceId(),
                feedback.getResource().getName(),
                feedback.getRating(),
                feedback.getComment(),
                feedback.getCreatedAt()
        );
    }
}
