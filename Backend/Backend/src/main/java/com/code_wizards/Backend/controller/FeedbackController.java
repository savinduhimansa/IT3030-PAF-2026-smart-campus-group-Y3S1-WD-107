package com.code_wizards.Backend.controller;

import com.code_wizards.Backend.dto.request.FeedbackRequest;
import com.code_wizards.Backend.entity.Feedback;
import com.code_wizards.Backend.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    // Add feedback
    @PostMapping
    public ResponseEntity<Feedback> addFeedback(@Validated @RequestBody FeedbackRequest request) {
        Feedback feedback = feedbackService.addFeedback(request);
        return ResponseEntity.ok(feedback);
    }

    // Get all feedback for a resource
    @GetMapping("/{resourceId}")
    public ResponseEntity<Map<String, Object>> getFeedbackByResource(@PathVariable Long resourceId) {
        List<Feedback> feedbackList = feedbackService.getFeedbackByResource(resourceId);
        Double avgRating = feedbackService.getAverageRating(resourceId);

        Map<String, Object> response = new HashMap<>();
        response.put("feedback", feedbackList);
        response.put("averageRating", avgRating);

        return ResponseEntity.ok(response);
    }
}
