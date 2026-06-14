package com.weblearning.controller;

import com.weblearning.dto.lesson.CreateLessonRequest;
import com.weblearning.dto.lesson.LessonResponse;
import com.weblearning.dto.lesson.ReorderLessonsRequest;
import com.weblearning.dto.lesson.UpdateLessonRequest;
import com.weblearning.entity.Lesson;
import com.weblearning.entity.User;
import com.weblearning.service.AuthService;
import com.weblearning.service.LessonService;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/chapters/{chapterId}/lessons/teacher")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<Page<LessonResponse>> getByChapter(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderIndex") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            Pageable pageable = createPageable(page, size, sortBy, direction);
            return ResponseEntity.ok(lessonService.getByChapterForInstructor(courseId, chapterId, instructor, pageable));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping
    public ResponseEntity<LessonResponse> create(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @Valid @RequestBody CreateLessonRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(lessonService.createForInstructor(courseId, chapterId, toEntity(request), instructor));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PutMapping("/{lessonId}")
    public ResponseEntity<LessonResponse> update(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @Valid @RequestBody UpdateLessonRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.ok(lessonService.updateForInstructor(courseId, chapterId, lessonId, toEntity(request), instructor));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/{lessonId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            lessonService.deleteForInstructor(courseId, chapterId, lessonId, instructor);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PatchMapping("/reorder")
    public ResponseEntity<List<LessonResponse>> reorder(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @Valid @RequestBody ReorderLessonsRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.ok(lessonService.reorderForInstructor(courseId, chapterId, request.getLessonIds(), instructor));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{lessonId}/upload-video")
    public ResponseEntity<LessonResponse> uploadVideo(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.ok(lessonService.uploadVideoForInstructor(courseId, chapterId, lessonId, file, instructor));
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

    private Lesson toEntity(CreateLessonRequest request) {
        Lesson lesson = new Lesson();
        lesson.setTitle(request.getTitle());
        lesson.setLessonType(request.getLessonType());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setDocumentUrl(request.getDocumentUrl());
        lesson.setDuration(request.getDuration());
        lesson.setContent(request.getContent());
        lesson.setOrderIndex(request.getOrderIndex());
        return lesson;
    }

    private Lesson toEntity(UpdateLessonRequest request) {
        Lesson lesson = new Lesson();
        lesson.setTitle(request.getTitle());
        lesson.setLessonType(request.getLessonType());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setDocumentUrl(request.getDocumentUrl());
        lesson.setDuration(request.getDuration());
        lesson.setContent(request.getContent());
        lesson.setOrderIndex(request.getOrderIndex());
        return lesson;
    }

    private Pageable createPageable(int page, int size, String sortBy, String direction) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        return PageRequest.of(page, size, sort);
    }
}
