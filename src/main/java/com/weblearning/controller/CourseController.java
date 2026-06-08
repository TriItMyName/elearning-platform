package com.weblearning.controller;

import com.weblearning.dto.course.CourseResponse;
import com.weblearning.dto.course.CreateCourseRequest;
import com.weblearning.dto.course.CreateTeacherCourseRequest;
import com.weblearning.dto.course.UpdateCourseRequest;
import com.weblearning.dto.course.UpdateTeacherCourseRequest;
import com.weblearning.entity.Category;
import com.weblearning.entity.Course;
import com.weblearning.entity.User;
import com.weblearning.service.AuthService;
import com.weblearning.service.CourseService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<List<CourseResponse>> getAll() {
        return ResponseEntity.ok(courseService.getAll());
    }

    @GetMapping("/my-courses")
    public ResponseEntity<List<CourseResponse>> getMyCourses(Authentication authentication) {
        User instructor = getCurrentUser(authentication);
        return ResponseEntity.ok(courseService.getCoursesByInstructor(instructor));
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
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createForInstructor(course, instructor));
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
            return ResponseEntity.ok(courseService.updateForInstructor(id, course, instructor));
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
        course.setStatus(request.getStatus());
        course.setCreatedAt(request.getCreatedAt() != null ? request.getCreatedAt() : LocalDateTime.now());
        course.setCategory(toCategory(request.getCategoryId()));
        return course;
    }

    private Course toEntity(UpdateTeacherCourseRequest request) {
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setSlug(request.getSlug());
        course.setDescription(request.getDescription());
        course.setStatus(request.getStatus());
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
}

