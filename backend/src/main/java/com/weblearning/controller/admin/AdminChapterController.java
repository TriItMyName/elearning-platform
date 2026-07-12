package com.weblearning.controller.admin;

import jakarta.validation.Valid;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.weblearning.dto.admin.AdminChapterDtoResponse;
import com.weblearning.dto.admin.AdminChapterRequest;
import com.weblearning.dto.admin.AdminChapterUpdateRequest;
import com.weblearning.service.admin.AdminChapterService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/chapters")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminChapterController {

    private final AdminChapterService adminChapterService;

    @PostMapping
    public ResponseEntity<AdminChapterDtoResponse> createChapter(@Valid @RequestBody AdminChapterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminChapterService.createChapter(request));
    }

    @GetMapping
    public ResponseEntity<Page<AdminChapterDtoResponse>> getAllChapters(
            @RequestParam(required = false) Long courseId,
            @ParameterObject @PageableDefault(size = 10, sort = "orderIndex", direction = Sort.Direction.ASC) Pageable pageable) {
        if (courseId != null) {
            return ResponseEntity.ok(adminChapterService.getChaptersByCourse(courseId, pageable));
        }
        return ResponseEntity.ok(adminChapterService.getAllChapters(pageable));
    }

    @GetMapping("/deleted")
    public ResponseEntity<Page<AdminChapterDtoResponse>> getDeletedChapters(
            @ParameterObject @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(adminChapterService.getDeletedChapters(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminChapterDtoResponse> getChapterById(@PathVariable Long id) {
        return ResponseEntity.ok(adminChapterService.getChapterById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminChapterDtoResponse> updateChapter(@PathVariable Long id,
            @Valid @RequestBody AdminChapterUpdateRequest request) {
        return ResponseEntity.ok(adminChapterService.updateChapter(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChapter(@PathVariable Long id) {
        adminChapterService.deleteChapter(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<AdminChapterDtoResponse> restoreChapter(@PathVariable Long id) {
        return ResponseEntity.ok(adminChapterService.restoreChapter(id));
    }
}
