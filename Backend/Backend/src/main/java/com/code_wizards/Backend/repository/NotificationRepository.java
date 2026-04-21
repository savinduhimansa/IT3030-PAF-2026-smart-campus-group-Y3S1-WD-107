package com.code_wizards.Backend.repository;

import com.code_wizards.Backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Fetch notifications for a specific user, ordered by latest first
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Count unread notifications for the bell icon badge
    long countByUserIdAndIsReadFalse(Long userId);
}