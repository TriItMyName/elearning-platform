package com.weblearning.controller;

import com.weblearning.dto.assignment.AssignmentResponse;
import com.weblearning.dto.assignment.CreateAssignmentRequest;
import com.weblearning.dto.assignment.UpdateAssignmentRequest;
import com.weblearning.entity.Assignment;
import com.weblearning.entity.User;
import com.weblearning.service.AssignmentService;
import com.weblearning.service.AuthService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/chapters/{chapterId}/lessons/{lessonId}/assignments/teacher")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<AssignmentResponse>> getByLesson(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.ok(
                    assignmentService.getByLessonForInstructor(courseId, chapterId, lessonId, instructor)
            );
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping
    public ResponseEntity<AssignmentResponse> create(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @Valid @RequestBody CreateAssignmentRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            Assignment assignment = toEntity(request);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    assignmentService.createForInstructor(courseId, chapterId, lessonId, assignment, instructor)
            );
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PutMapping("/{assignmentId}")
    public ResponseEntity<AssignmentResponse> update(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @PathVariable Long assignmentId,
            @Valid @RequestBody UpdateAssignmentRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            Assignment assignment = toEntity(request);

            return ResponseEntity.ok(
                    assignmentService.updateForInstructor(courseId, chapterId, lessonId, assignmentId, assignment, instructor)
            );
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @PathVariable Long assignmentId,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            assignmentService.deleteForInstructor(courseId, chapterId, lessonId, assignmentId, instructor);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    private User getCurrentUser(Authentication authentication) {
        return authService.getUserByUserName(authentication.getName());
    }

    private Assignment toEntity(CreateAssignmentRequest request) {
        Assignment assignment = new Assignment();
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setAttachmentUrl(request.getAttachmentUrl());
        assignment.setDeadline(request.getDeadline());
        assignment.setMaxScore(request.getMaxScore());
        return assignment;
    }

    private Assignment toEntity(UpdateAssignmentRequest request) {
        Assignment assignment = new Assignment();
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setAttachmentUrl(request.getAttachmentUrl());
        assignment.setDeadline(request.getDeadline());
        assignment.setMaxScore(request.getMaxScore());
        return assignment;
    }
}
