package com.weblearning.service;

import com.weblearning.dto.notification.NotificationResponse;
import com.weblearning.entity.User;

import java.util.List;

public interface NotificationService {
    NotificationResponse sendToStudentForInstructor(Long courseId, Long studentId, String message, User instructor);

    List<NotificationResponse> sendToCourseStudentsForInstructor(Long courseId, String message, User instructor);
}
