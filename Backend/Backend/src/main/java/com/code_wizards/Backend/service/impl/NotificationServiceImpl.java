package com.code_wizards.Backend.service.impl;

import com.code_wizards.Backend.entity.Notification;
import com.code_wizards.Backend.entity.User;
import com.code_wizards.Backend.repository.NotificationRepository;
import com.code_wizards.Backend.repository.UserRepository;
import com.code_wizards.Backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void sendNotification(Long userId, String message, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        Notification savedNotification = notificationRepository.save(notification);

        // --- FIXED: Create a safe Map to prevent JSON infinite recursion errors ---
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", savedNotification.getId());
        payload.put("message", savedNotification.getMessage());
        payload.put("type", savedNotification.getType());
        payload.put("read", false);
        payload.put("isRead", false);
        payload.put("createdAt", savedNotification.getCreatedAt() != null ? savedNotification.getCreatedAt().toString() : java.time.LocalDateTime.now().toString());

        System.out.println("📢 Broadcasting LIVE notification to Topic: /topic/user/" + user.getId() + "/notifications");

        messagingTemplate.convertAndSend(
                "/topic/user/" + user.getId() + "/notifications",
                payload
        );
        // -------------------------------------------------------------------------
    }

    @Override
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}