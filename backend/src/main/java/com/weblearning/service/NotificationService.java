package com.weblearning.service;

import com.weblearning.dto.notification.NotificationResponse;
import com.weblearning.entity.User;

import java.util.List;

public interface NotificationService {
    NotificationResponse sendToStudentForInstructor(Long courseId, Long studentId, String message, User instructor);

    List<NotificationResponse> sendToCourseStudentsForInstructor(Long courseId, String message, User instructor);

    List<NotificationResponse> getNotificationsForStudent(User student);

    List<NotificationResponse> getCourseNotificationsForStudent(Long courseId, User student);

    NotificationResponse markAsReadForStudent(Long notificationId, User student);
}
