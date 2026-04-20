package com.code_wizards.Backend.dto;

import java.time.LocalDateTime;

public class VerifyResponse {

    private boolean valid;
    private String reason;

    private Long resourceId;
    private Long userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private int expectedAttendees;

    public VerifyResponse(boolean valid, String reason, Long resourceId, Long userId, LocalDateTime startTime,
                          LocalDateTime endTime, String purpose, int expectedAttendees) {
        this.valid = valid;
        this.reason = reason;
        this.resourceId = resourceId;
        this.userId = userId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.purpose = purpose;
        this.expectedAttendees = expectedAttendees;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public int getExpectedAttendees() {
        return expectedAttendees;
    }

    public void setExpectedAttendees(int expectedAttendees) {
        this.expectedAttendees = expectedAttendees;
    }
}
