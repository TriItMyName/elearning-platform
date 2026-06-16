package com.weblearning.controller;

import com.weblearning.dto.notification.NotificationResponse;
import com.weblearning.entity.User;
import com.weblearning.service.AuthService;
import com.weblearning.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    @GetMapping("/student")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(Authentication authentication) {
        User student = getCurrentUser(authentication);
        return ResponseEntity.ok(notificationService.getNotificationsForStudent(student));
    }

    @GetMapping("/student/courses/{courseId}")
    public ResponseEntity<List<NotificationResponse>> getMyCourseNotifications(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        try {
            User student = getCurrentUser(authentication);
            return ResponseEntity.ok(notificationService.getCourseNotificationsForStudent(courseId, student));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/student/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication
    ) {
        try {
            User student = getCurrentUser(authentication);
            return ResponseEntity.ok(notificationService.markAsReadForStudent(notificationId, student));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    private User getCurrentUser(Authentication authentication) {
        return authService.getUserByUserName(authentication.getName());
    }
}
