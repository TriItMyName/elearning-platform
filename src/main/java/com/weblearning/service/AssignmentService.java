package com.weblearning.service;

import com.weblearning.dto.assignment.AssignmentResponse;
import com.weblearning.entity.Assignment;
import com.weblearning.entity.User;

import java.util.List;

public interface AssignmentService {
    List<AssignmentResponse> getByLessonForInstructor(Long courseId, Long chapterId, Long lessonId, User instructor);

    AssignmentResponse createForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Assignment assignment,
            User instructor
    );
}
