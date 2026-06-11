package com.weblearning.service.impl;

import com.weblearning.dto.assignment.AssignmentResponse;
import com.weblearning.entity.Assignment;
import com.weblearning.entity.Lesson;
import com.weblearning.entity.User;
import com.weblearning.repository.AssignmentRepository;
import com.weblearning.repository.LessonRepository;
import com.weblearning.service.AssignmentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final LessonRepository lessonRepository;

    private AssignmentResponse toResponse(Assignment assignment) {
        AssignmentResponse response = new AssignmentResponse();
        response.setId(assignment.getId());
        response.setLessonId(assignment.getLesson() != null ? assignment.getLesson().getId() : null);
        response.setTitle(assignment.getTitle());
        response.setDescription(assignment.getDescription());
        response.setAttachmentUrl(assignment.getAttachmentUrl());
        response.setDeadline(assignment.getDeadline());
        response.setMaxScore(assignment.getMaxScore());
        response.setCreatedAt(assignment.getCreatedAt());
        return response;
    }

    @Override
    public List<AssignmentResponse> getByLessonForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            User instructor
    ) {
        getOwnedLesson(courseId, chapterId, lessonId, instructor);

        return assignmentRepository.findByLessonIdAndDeletedFalseOrderByCreatedAtDesc(lessonId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AssignmentResponse createForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Assignment assignment,
            User instructor
    ) {
        Lesson lesson = getOwnedLesson(courseId, chapterId, lessonId, instructor);

        assignment.setLesson(lesson);
        assignment.setCreatedAt(LocalDateTime.now());

        return toResponse(assignmentRepository.save(assignment));
    }

    @Override
    public AssignmentResponse updateForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long assignmentId,
            Assignment assignment,
            User instructor
    ) {
        getOwnedLesson(courseId, chapterId, lessonId, instructor);
        Assignment existing = getAssignmentInLesson(lessonId, assignmentId);

        existing.setTitle(assignment.getTitle());
        existing.setDescription(assignment.getDescription());
        existing.setAttachmentUrl(assignment.getAttachmentUrl());
        existing.setDeadline(assignment.getDeadline());
        existing.setMaxScore(assignment.getMaxScore());

        return toResponse(assignmentRepository.save(existing));
    }

    @Override
    public void deleteForInstructor(Long courseId, Long chapterId, Long lessonId, Long assignmentId, User instructor) {
        getOwnedLesson(courseId, chapterId, lessonId, instructor);
        Assignment assignment = getAssignmentInLesson(lessonId, assignmentId);

        assignment.setDeleted(true);
        assignment.setDeletedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);
    }

    private Assignment getAssignmentInLesson(Long lessonId, Long assignmentId) {
        Assignment assignment = assignmentRepository.findByIdAndDeletedFalse(assignmentId)
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found: " + assignmentId));

        if (assignment.getLesson() == null || !assignment.getLesson().getId().equals(lessonId)) {
            throw new EntityNotFoundException("Assignment not found in lesson: " + lessonId);
        }

        return assignment;
    }

    private Lesson getOwnedLesson(Long courseId, Long chapterId, Long lessonId, User instructor) {
        Lesson lesson = lessonRepository.findByIdAndDeletedFalse(lessonId)
                .orElseThrow(() -> new EntityNotFoundException("Lesson not found: " + lessonId));

        if (lesson.getChapter() == null || !lesson.getChapter().getId().equals(chapterId)) {
            throw new EntityNotFoundException("Lesson not found in chapter: " + chapterId);
        }

        if (lesson.getChapter().getCourse() == null
                || !lesson.getChapter().getCourse().getId().equals(courseId)) {
            throw new EntityNotFoundException("Chapter not found in course: " + courseId);
        }

        if (lesson.getChapter().getCourse().getInstructor() == null
                || !lesson.getChapter().getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("You are not the instructor of this course");
        }

        return lesson;
    }
}
