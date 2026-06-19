package com.weblearning.service;

import com.weblearning.dto.course.StudentLearningProgressResponse;
import com.weblearning.dto.course.StudentProgressOverviewResponse;
import com.weblearning.entity.User;

public interface LearningProgressService {
    StudentLearningProgressResponse getStudentProgressForInstructor(Long courseId, Long studentId, User instructor);

    StudentLearningProgressResponse getStudentProgressForStudent(Long courseId, User student);

    StudentProgressOverviewResponse getProgressOverviewForStudent(User student);

    StudentLearningProgressResponse completeLessonForStudent(Long courseId, Long lessonId, User student);
}
