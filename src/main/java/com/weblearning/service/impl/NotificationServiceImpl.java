package com.weblearning.service.impl;

import com.weblearning.dto.notification.NotificationResponse;
import com.weblearning.entity.Course;
import com.weblearning.entity.Enrollment;
import com.weblearning.entity.Notification;
import com.weblearning.entity.User;
import com.weblearning.repository.CourseRepository;
import com.weblearning.repository.EnrollmentRepository;
import com.weblearning.repository.NotificationRepository;
import com.weblearning.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    @Override
    public NotificationResponse sendToStudentForInstructor(Long courseId, Long studentId, String message, User instructor) {
        Course course = getOwnedCourse(courseId, instructor);
        Enrollment enrollment = enrollmentRepository.findByCourseIdAndStudentIdAndDeletedFalse(courseId, studentId)
                .orElseThrow(() -> new EntityNotFoundException("Enrollment not found for student: " + studentId));

        Notification notification = createNotification(course, enrollment.getStudent(), message, instructor);
        return toResponse(notificationRepository.save(notification));
    }

    @Override
    public List<NotificationResponse> sendToCourseStudentsForInstructor(Long courseId, String message, User instructor) {
        Course course = getOwnedCourse(courseId, instructor);
        List<Enrollment> enrollments = enrollmentRepository.findByCourseIdAndDeletedFalseOrderByEnrolledAtDesc(courseId);

        List<Notification> notifications = enrollments.stream()
                .filter(enrollment -> enrollment.getStudent() != null)
                .map(enrollment -> createNotification(course, enrollment.getStudent(), message, instructor))
                .toList();

        return notificationRepository.saveAll(notifications).stream()
                .map(this::toResponse)
                .toList();
    }

    private Notification createNotification(Course course, User receiver, String message, User sender) {
        Notification notification = new Notification();
        notification.setCourse(course);
        notification.setReceiver(receiver);
        notification.setSender(sender);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setDeleted(false);
        return notification;
    }

    private Course getOwnedCourse(Long courseId, User instructor) {
        Course course = courseRepository.findByIdAndDeletedFalse(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + courseId));

        if (course.getInstructor() == null || !course.getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("You are not the instructor of this course");
        }

        return course;
    }

    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setMessage(notification.getMessage());
        response.setIsRead(notification.getIsRead());
        response.setCreatedAt(notification.getCreatedAt());

        if (notification.getSender() != null) {
            response.setSenderId(notification.getSender().getId());
            response.setSenderName(notification.getSender().getFullName());
        }

        if (notification.getReceiver() != null) {
            response.setReceiverId(notification.getReceiver().getId());
            response.setReceiverName(notification.getReceiver().getFullName());
        }

        if (notification.getCourse() != null) {
            response.setCourseId(notification.getCourse().getId());
            response.setCourseTitle(notification.getCourse().getTitle());
        }

        return response;
    }
}
