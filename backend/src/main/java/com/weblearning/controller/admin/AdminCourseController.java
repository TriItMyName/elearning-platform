package com.weblearning.controller.admin;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<AdminCourseDtoResponse>> getAllCourses() {
        return ResponseEntity.ok(adminCourseService.getAllCourses());
    }

    @GetMapping("/deleted")
    public ResponseEntity<List<AdminCourseDtoResponse>> getDeletedCourses() {
        return ResponseEntity.ok(adminCourseService.getDeletedCourses());
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
}
