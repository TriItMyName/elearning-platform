package com.weblearning.service.impl;

import com.weblearning.dto.assignment.AssignmentSubmissionResponse;
import com.weblearning.entity.Assignment;
import com.weblearning.entity.AssignmentSubmission;
import com.weblearning.entity.Lesson;
import com.weblearning.entity.User;
import com.weblearning.repository.AssignmentRepository;
import com.weblearning.repository.AssignmentSubmissionRepository;
import com.weblearning.repository.LessonRepository;
import com.weblearning.service.AssignmentSubmissionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentSubmissionServiceImpl implements AssignmentSubmissionService {

    private final AssignmentSubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final LessonRepository lessonRepository;

    @Override
    public List<AssignmentSubmissionResponse> getSubmissionsForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long assignmentId,
            User instructor
    ) {
        getOwnedAssignment(courseId, chapterId, lessonId, assignmentId, instructor);

        return submissionRepository.findByAssignmentIdAndDeletedFalseOrderBySubmittedAtDesc(assignmentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AssignmentSubmissionResponse getSubmissionForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long assignmentId,
            Long submissionId,
            User instructor
    ) {
        getOwnedAssignment(courseId, chapterId, lessonId, assignmentId, instructor);
        return toResponse(getSubmissionInAssignment(assignmentId, submissionId));
    }

    @Override
    public AssignmentSubmissionResponse gradeForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long assignmentId,
            Long submissionId,
            Integer score,
            String feedback,
            User instructor
    ) {
        Assignment assignment = getOwnedAssignment(courseId, chapterId, lessonId, assignmentId, instructor);
        AssignmentSubmission submission = getSubmissionInAssignment(assignmentId, submissionId);

        if (score > assignment.getMaxScore()) {
            throw new IllegalArgumentException("Score cannot be greater than assignment max score");
        }

        submission.setScore(score);
        submission.setFeedback(feedback);
        submission.setGradedAt(LocalDateTime.now());
        submission.setGradedBy(instructor);

        return toResponse(submissionRepository.save(submission));
    }

    private Assignment getOwnedAssignment(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long assignmentId,
            User instructor
    ) {
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

        Assignment assignment = assignmentRepository.findByIdAndDeletedFalse(assignmentId)
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found: " + assignmentId));

        if (assignment.getLesson() == null || !assignment.getLesson().getId().equals(lessonId)) {
            throw new EntityNotFoundException("Assignment not found in lesson: " + lessonId);
        }

        return assignment;
    }

    private AssignmentSubmission getSubmissionInAssignment(Long assignmentId, Long submissionId) {
        AssignmentSubmission submission = submissionRepository.findByIdAndDeletedFalse(submissionId)
                .orElseThrow(() -> new EntityNotFoundException("Assignment submission not found: " + submissionId));

        if (submission.getAssignment() == null || !submission.getAssignment().getId().equals(assignmentId)) {
            throw new EntityNotFoundException("Submission not found in assignment: " + assignmentId);
        }

        return submission;
    }

    private AssignmentSubmissionResponse toResponse(AssignmentSubmission submission) {
        AssignmentSubmissionResponse response = new AssignmentSubmissionResponse();
        response.setId(submission.getId());
        response.setAssignmentId(submission.getAssignment() != null ? submission.getAssignment().getId() : null);
        response.setContent(submission.getContent());
        response.setAttachmentUrl(submission.getAttachmentUrl());
        response.setSubmittedAt(submission.getSubmittedAt());
        response.setScore(submission.getScore());
        response.setFeedback(submission.getFeedback());
        response.setGradedAt(submission.getGradedAt());

        if (submission.getStudent() != null) {
            response.setStudentId(submission.getStudent().getId());
            response.setStudentName(submission.getStudent().getFullName());
            response.setStudentEmail(submission.getStudent().getEmail());
        }

        if (submission.getGradedBy() != null) {
            response.setGradedById(submission.getGradedBy().getId());
            response.setGradedByName(submission.getGradedBy().getFullName());
        }

        return response;
    }
}
