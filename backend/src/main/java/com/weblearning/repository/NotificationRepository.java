package com.weblearning.repository;

import com.weblearning.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiverIdAndDeletedFalseOrderByCreatedAtDesc(Long receiverId);

    List<Notification> findByCourseIdAndDeletedFalseOrderByCreatedAtDesc(Long courseId);
}
