package com.code_wizards.Backend.controller;

import com.code_wizards.Backend.entity.Notification;
import com.code_wizards.Backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Get all notifications for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    // Get unread notification count
    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    // Mark a specific notification as read
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    // --- NEW: Endpoint to send notifications (e.g., Welcome message from Login) ---
    @PostMapping("/send")
    public ResponseEntity<Void> sendNotification(
            @RequestParam Long userId,
            @RequestParam String message,
            @RequestParam String type) {

        notificationService.sendNotification(userId, message, type);
        return ResponseEntity.ok().build();
    }
    // ------------------------------------------------------------------------------
}