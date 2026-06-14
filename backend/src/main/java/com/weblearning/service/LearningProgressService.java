package com.weblearning.service;

import com.weblearning.dto.course.StudentLearningProgressResponse;
import com.weblearning.entity.User;

public interface LearningProgressService {
    StudentLearningProgressResponse getStudentProgressForInstructor(Long courseId, Long studentId, User instructor);
}
