package com.weblearning.controller;

import com.weblearning.dto.chapter.ChapterResponse;
import com.weblearning.dto.chapter.CreateChapterRequest;
import com.weblearning.dto.chapter.ReorderChaptersRequest;
import com.weblearning.dto.chapter.UpdateChapterRequest;
import com.weblearning.entity.Chapter;
import com.weblearning.entity.User;
import com.weblearning.service.AuthService;
import com.weblearning.service.ChapterService;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/chapters")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<Page<ChapterResponse>> getByCourseId(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderIndex") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Pageable pageable = createPageable(page, size, sortBy, direction);
        return ResponseEntity.ok(chapterService.getByCourseId(courseId, pageable));
    }

    @PostMapping("/teacher")
    public ResponseEntity<ChapterResponse> createByTeacher(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateChapterRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(chapterService.createForInstructor(courseId, toEntity(request), instructor));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PutMapping("/teacher/{chapterId}")
    public ResponseEntity<ChapterResponse> updateByTeacher(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @Valid @RequestBody UpdateChapterRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.ok(chapterService.updateForInstructor(courseId, chapterId, toEntity(request), instructor));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/teacher/{chapterId}")
    public ResponseEntity<Void> deleteByTeacher(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            chapterService.deleteForInstructor(courseId, chapterId, instructor);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PatchMapping("/teacher/reorder")
    public ResponseEntity<List<ChapterResponse>> reorderByTeacher(
            @PathVariable Long courseId,
            @Valid @RequestBody ReorderChaptersRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.ok(chapterService.reorderForInstructor(courseId, request.getChapterIds(), instructor));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    private User getCurrentUser(Authentication authentication) {
        return authService.getUserByUserName(authentication.getName());
    }

    private Chapter toEntity(CreateChapterRequest request) {
        Chapter chapter = new Chapter();
        chapter.setTitle(request.getTitle());
        chapter.setOrderIndex(request.getOrderIndex());
        return chapter;
    }

    private Chapter toEntity(UpdateChapterRequest request) {
        Chapter chapter = new Chapter();
        chapter.setTitle(request.getTitle());
        chapter.setOrderIndex(request.getOrderIndex());
        return chapter;
    }

    private Pageable createPageable(int page, int size, String sortBy, String direction) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        return PageRequest.of(page, size, sort);
    }
}
