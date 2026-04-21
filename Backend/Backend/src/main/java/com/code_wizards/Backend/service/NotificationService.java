package com.code_wizards.Backend.service;

import com.code_wizards.Backend.entity.Notification;
import java.util.List;

public interface NotificationService {
    void sendNotification(Long userId, String message, String type);

    List<Notification> getUserNotifications(Long userId);

    void markAsRead(Long notificationId);

    long getUnreadCount(Long userId);
}