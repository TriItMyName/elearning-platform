package com.weblearning.service;

import com.weblearning.dto.assignment.AssignmentSubmissionResponse;
import com.weblearning.entity.User;

import java.util.List;

public interface AssignmentSubmissionService {
    List<AssignmentSubmissionResponse> getSubmissionsForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long assignmentId,
            User instructor
    );

    AssignmentSubmissionResponse getSubmissionForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long assignmentId,
            Long submissionId,
            User instructor
    );

    AssignmentSubmissionResponse gradeForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long assignmentId,
            Long submissionId,
            Integer score,
            String feedback,
            User instructor
    );
}
