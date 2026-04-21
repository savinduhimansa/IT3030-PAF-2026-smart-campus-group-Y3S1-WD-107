package com.code_wizards.Backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The recipient of the notification
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String message;

    private String type; // e.g., "WELCOME", "RESOURCE", "TICKET"

    private boolean isRead = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}