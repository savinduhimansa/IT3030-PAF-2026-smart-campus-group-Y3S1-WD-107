package com.code_wizards.Backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
public class BookingStatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private LocalDateTime changedAt;

    private String changedBy;

    public BookingStatusHistory() {
    }

    public BookingStatusHistory(Booking booking, BookingStatus status, LocalDateTime changedAt, String changedBy) {
        this.booking = booking;
        this.status = status;
        this.changedAt = changedAt;
        this.changedBy = changedBy;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }
}
