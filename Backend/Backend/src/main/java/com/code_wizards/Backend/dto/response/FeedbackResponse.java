package com.code_wizards.Backend.dto.response;

import java.time.LocalDateTime;

public class FeedbackResponse {
    private Long feedbackId;
    private Long resourceId;
    private String resourceName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public FeedbackResponse() {}

    public FeedbackResponse(Long feedbackId, Long resourceId, String resourceName, Integer rating, String comment, LocalDateTime createdAt) {
        this.feedbackId = feedbackId;
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public Long getFeedbackId() { return feedbackId; }
    public void setFeedbackId(Long feedbackId) { this.feedbackId = feedbackId; }
    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
