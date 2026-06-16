package com.weblearning.controller.admin;

import java.util.List;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.weblearning.dto.admin.AdminLessonDtoResponse;
import com.weblearning.dto.admin.AdminLessonRequest;
import com.weblearning.dto.admin.AdminLessonUpdateRequest;
import com.weblearning.service.admin.AdminLessonService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/lessons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminLessonController {

    private final AdminLessonService adminLessonService;

    @PostMapping
    public ResponseEntity<AdminLessonDtoResponse> createLesson(@Valid @RequestBody AdminLessonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminLessonService.createLesson(request));
    }

    @GetMapping
    public ResponseEntity<Page<AdminLessonDtoResponse>> getAllLessons(
            @RequestParam(required = false) Long chapterId,
            @ParameterObject @PageableDefault(size = 10, sort = "orderIndex", direction = Sort.Direction.ASC) Pageable pageable) {
        if (chapterId != null) {
            return ResponseEntity.ok(adminLessonService.getLessonsByChapter(chapterId, pageable));
        }
        return ResponseEntity.ok(adminLessonService.getAllLessons(pageable));
    }

    @GetMapping("/deleted")
    public ResponseEntity<Page<AdminLessonDtoResponse>> getDeletedLessons(
            @ParameterObject @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(adminLessonService.getDeletedLessons(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminLessonDtoResponse> getLessonById(@PathVariable Long id) {
        return ResponseEntity.ok(adminLessonService.getLessonById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminLessonDtoResponse> updateLesson(@PathVariable Long id,
            @Valid @RequestBody AdminLessonUpdateRequest request) {
        return ResponseEntity.ok(adminLessonService.updateLesson(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id) {
        adminLessonService.deleteLesson(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<AdminLessonDtoResponse> restoreLesson(@PathVariable Long id) {
        return ResponseEntity.ok(adminLessonService.restoreLesson(id));
    }

    @PostMapping("/{id}/upload-video")
    public ResponseEntity<AdminLessonDtoResponse> uploadVideo(@PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(adminLessonService.uploadVideo(id, file));
    }

    @PostMapping("/{id}/upload-document")
    public ResponseEntity<AdminLessonDtoResponse> uploadDocument(@PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(adminLessonService.uploadDocument(id, file));
    }
}
