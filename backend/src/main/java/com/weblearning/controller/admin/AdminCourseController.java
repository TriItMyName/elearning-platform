package com.weblearning.controller.admin;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.weblearning.dto.admin.AdminCourseDtoResponse;
import com.weblearning.dto.admin.AdminCourseRequest;
import com.weblearning.dto.admin.AdminCourseUpdateRequest;
import com.weblearning.service.admin.AdminCourseService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseController {
    private final AdminCourseService adminCourseService;

    @PostMapping
    public ResponseEntity<AdminCourseDtoResponse> createCourse(@Valid @RequestBody AdminCourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminCourseService.createCourse(request));
    }

    @GetMapping
    public ResponseEntity<Page<AdminCourseDtoResponse>> getAllCourses(
            @ParameterObject @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(adminCourseService.getAllCourses(pageable));
    }

    @GetMapping("/deleted")
    public ResponseEntity<Page<AdminCourseDtoResponse>> getDeletedCourses(
            @ParameterObject @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(adminCourseService.getDeletedCourses(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminCourseDtoResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(adminCourseService.getCourseById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminCourseDtoResponse> updateCourse(@PathVariable Long id,
            @Valid @RequestBody AdminCourseUpdateRequest request) {
        return ResponseEntity.ok(adminCourseService.updateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        adminCourseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<AdminCourseDtoResponse> restoreCourse(@PathVariable Long id) {
        return ResponseEntity.ok(adminCourseService.restoreCourse(id));
    }

    @GetMapping("/pending")
    public ResponseEntity<Page<AdminCourseDtoResponse>> getPendingCourses(
            @ParameterObject @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(adminCourseService.getPendingCourses(pageable));
    }

    @GetMapping("/rejected")
    public ResponseEntity<Page<AdminCourseDtoResponse>> getRejectedCourses(
            @ParameterObject @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(adminCourseService.getRejectedCourses(pageable));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<AdminCourseDtoResponse> approveCourse(@PathVariable Long id) {
        return ResponseEntity.ok(adminCourseService.approveCourse(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<AdminCourseDtoResponse> rejectCourse(@PathVariable Long id) {
        return ResponseEntity.ok(adminCourseService.rejectCourse(id));
    }
}
