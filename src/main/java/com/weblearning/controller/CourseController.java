package com.weblearning.controller;

import com.weblearning.dto.course.CourseResponse;
import com.weblearning.dto.course.CreateCourseRequest;
import com.weblearning.dto.course.UpdateCourseRequest;
import com.weblearning.entity.Category;
import com.weblearning.entity.Course;
import com.weblearning.entity.User;
import com.weblearning.service.CourseService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody CreateCourseRequest request) {
        Course course = toEntity(request);
        Course created = courseService.create(course);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getById(@PathVariable Long id) {
        return courseService.getById(id)
                .map(course -> ResponseEntity.ok(toResponse(course)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAll() {
        List<CourseResponse> responses = courseService.getAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateCourseRequest request) {
        try {
            Course course = toEntity(request);
            return ResponseEntity.ok(toResponse(courseService.update(id, course)));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
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

    private CourseResponse toResponse(Course course) {
        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setTitle(course.getTitle());
        response.setSlug(course.getSlug());
        response.setDescription(course.getDescription());
        response.setStatus(course.getStatus());
        response.setCreatedAt(course.getCreatedAt());
        response.setCategoryId(course.getCategory() != null ? course.getCategory().getId() : null);
        response.setInstructorId(course.getInstructor() != null ? course.getInstructor().getId() : null);
        return response;
    }
}

