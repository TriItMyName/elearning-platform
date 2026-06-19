package com.weblearning.controller;

import com.weblearning.dto.course.CourseContentResponse;
import com.weblearning.dto.course.CourseResponse;
import com.weblearning.dto.enrollment.EnrollmentResponse;
import com.weblearning.dto.course.CreateCourseRequest;
import com.weblearning.dto.course.CreateTeacherCourseRequest;
import com.weblearning.dto.course.StudentLearningProgressResponse;
import com.weblearning.dto.course.StudentProgressOverviewResponse;
import com.weblearning.dto.course.UpdateCourseRequest;
import com.weblearning.dto.course.UpdateTeacherCourseRequest;
import com.weblearning.dto.notification.CreateNotificationRequest;
import com.weblearning.dto.notification.NotificationResponse;
import com.weblearning.entity.Category;
import com.weblearning.entity.Course;
import com.weblearning.entity.User;
import com.weblearning.service.AuthService;
import com.weblearning.service.CourseService;
import com.weblearning.service.EnrollmentService;
import com.weblearning.service.LearningProgressService;
import com.weblearning.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final EnrollmentService enrollmentService;
    private final LearningProgressService learningProgressService;
    private final NotificationService notificationService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody CreateCourseRequest request) {
        Course course = toEntity(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.create(course));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getById(@PathVariable Long id) {
        return courseService.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<Page<CourseResponse>> getAll(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Pageable pageable = createPageable(page, size, sortBy, direction);
        if (authentication != null && authentication.isAuthenticated()) {
            User student = getCurrentUser(authentication);
            return ResponseEntity.ok(courseService.getAllForStudent(student, pageable));
        }
        return ResponseEntity.ok(courseService.getAll(pageable));
    }

    @GetMapping("/my-courses")
    public ResponseEntity<Page<CourseResponse>> getMyCourses(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        User instructor = getCurrentUser(authentication);
        Pageable pageable = createPageable(page, size, sortBy, direction);
        return ResponseEntity.ok(courseService.getCoursesByInstructor(instructor, pageable));
    }

    @GetMapping("/{id}/enrollment-count")
    public ResponseEntity<Long> getEnrollmentCount(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(enrollmentService.countStudents(id));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<EnrollmentResponse> enrollCourse(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            User student = getCurrentUser(authentication);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(enrollmentService.enrollCourseForStudent(id, student));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/content/student")
    public ResponseEntity<CourseContentResponse> getCourseContentForStudent(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            User student = getCurrentUser(authentication);
            return ResponseEntity.ok(courseService.getCourseContentForStudent(id, student));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/{id}/progress/student")
    public ResponseEntity<StudentLearningProgressResponse> getMyLearningProgress(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            User student = getCurrentUser(authentication);
            return ResponseEntity.ok(learningProgressService.getStudentProgressForStudent(id, student));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/progress/student/overview")
    public ResponseEntity<StudentProgressOverviewResponse> getMyProgressOverview(
            Authentication authentication
    ) {
        User student = getCurrentUser(authentication);
        return ResponseEntity.ok(learningProgressService.getProgressOverviewForStudent(student));
    }

    @PostMapping("/{id}/lessons/{lessonId}/progress/student/complete")
    public ResponseEntity<StudentLearningProgressResponse> completeLesson(
            @PathVariable Long id,
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        try {
            User student = getCurrentUser(authentication);
            return ResponseEntity.ok(learningProgressService.completeLessonForStudent(id, lessonId, student));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateCourseRequest request) {
        try {
            Course course = toEntity(request);
            return ResponseEntity.ok(courseService.update(id, course));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/teacher")
    public ResponseEntity<CourseResponse> createByTeacher(
            @Valid @RequestBody CreateTeacherCourseRequest request,
            Authentication authentication
    ) {
        User instructor = getCurrentUser(authentication);
        Course course = toEntity(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.createForInstructor(course, instructor, Boolean.TRUE.equals(request.getSubmitForReview())));
    }

    @PutMapping("/teacher/{id}")
    public ResponseEntity<CourseResponse> updateByTeacher(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTeacherCourseRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            Course course = toEntity(request);
            return ResponseEntity.ok(courseService.updateForInstructor(id, course, instructor, Boolean.TRUE.equals(request.getSubmitForReview())));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/teacher/{id}")
    public ResponseEntity<Void> deleteByTeacher(@PathVariable Long id, Authentication authentication) {
        try {
            User instructor = getCurrentUser(authentication);
            courseService.deleteForInstructor(id, instructor);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/teacher/{id}/students")
    public ResponseEntity<List<EnrollmentResponse>> getStudentsByTeacher(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.ok(enrollmentService.getStudentsForInstructor(id, instructor));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/teacher/{id}/students/{studentId}/progress")
    public ResponseEntity<StudentLearningProgressResponse> getStudentProgressByTeacher(
            @PathVariable Long id,
            @PathVariable Long studentId,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.ok(learningProgressService.getStudentProgressForInstructor(id, studentId, instructor));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/teacher/{id}/notifications")
    public ResponseEntity<List<NotificationResponse>> sendNotificationToCourseStudents(
            @PathVariable Long id,
            @Valid @RequestBody CreateNotificationRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(notificationService.sendToCourseStudentsForInstructor(id, request.getMessage(), instructor));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/teacher/{id}/students/{studentId}/notifications")
    public ResponseEntity<NotificationResponse> sendNotificationToStudent(
            @PathVariable Long id,
            @PathVariable Long studentId,
            @Valid @RequestBody CreateNotificationRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(notificationService.sendToStudentForInstructor(id, studentId, request.getMessage(), instructor));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            courseService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    private Course toEntity(CreateCourseRequest request) {
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setSlug(request.getSlug());
        course.setDescription(request.getDescription());
        course.setThumbnail(request.getThumbnail());
        course.setStatus(request.getStatus());
        course.setCreatedAt(request.getCreatedAt() != null ? request.getCreatedAt() : LocalDateTime.now());
        course.setCategory(toCategory(request.getCategoryId()));
        course.setInstructor(toInstructor(request.getInstructorId()));
        return course;
    }

    private Course toEntity(UpdateCourseRequest request) {
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setSlug(request.getSlug());
        course.setDescription(request.getDescription());
        course.setThumbnail(request.getThumbnail());
        course.setStatus(request.getStatus());
        course.setCreatedAt(request.getCreatedAt() != null ? request.getCreatedAt() : LocalDateTime.now());
        course.setCategory(toCategory(request.getCategoryId()));
        course.setInstructor(toInstructor(request.getInstructorId()));
        return course;
    }

    private Course toEntity(CreateTeacherCourseRequest request) {
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setSlug(request.getSlug());
        course.setDescription(request.getDescription());
        course.setThumbnail(request.getThumbnail());
        course.setCreatedAt(request.getCreatedAt() != null ? request.getCreatedAt() : LocalDateTime.now());
        course.setCategory(toCategory(request.getCategoryId()));
        return course;
    }

    private Course toEntity(UpdateTeacherCourseRequest request) {
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setSlug(request.getSlug());
        course.setDescription(request.getDescription());
        course.setThumbnail(request.getThumbnail());
        course.setCreatedAt(request.getCreatedAt() != null ? request.getCreatedAt() : LocalDateTime.now());
        course.setCategory(toCategory(request.getCategoryId()));
        return course;
    }

    private User getCurrentUser(Authentication authentication) {
        return authService.getUserByUserName(authentication.getName());
    }

    private Category toCategory(Long categoryId) {
        Category category = new Category();
        category.setId(categoryId);
        return category;
    }

    private User toInstructor(Long instructorId) {
        User instructor = new User();
        instructor.setId(instructorId);
        return instructor;
    }

    private Pageable createPageable(int page, int size, String sortBy, String direction) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        return PageRequest.of(page, size, sort);
    }
}
