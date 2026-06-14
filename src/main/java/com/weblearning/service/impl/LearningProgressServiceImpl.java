package com.weblearning.service.impl;

import com.weblearning.dto.course.LearningProgressResponse;
import com.weblearning.dto.course.StudentLearningProgressResponse;
import com.weblearning.entity.Course;
import com.weblearning.entity.Enrollment;
import com.weblearning.entity.LearningProgress;
import com.weblearning.entity.Lesson;
import com.weblearning.entity.User;
import com.weblearning.repository.CourseRepository;
import com.weblearning.repository.EnrollmentRepository;
import com.weblearning.repository.LearningProgressRepository;
import com.weblearning.repository.LessonRepository;
import com.weblearning.service.LearningProgressService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningProgressServiceImpl implements LearningProgressService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final LearningProgressRepository learningProgressRepository;

    @Override
    public StudentLearningProgressResponse getStudentProgressForInstructor(Long courseId, Long studentId, User instructor) {
        getOwnedCourse(courseId, instructor);
        Enrollment enrollment = enrollmentRepository.findByCourseIdAndStudentIdAndDeletedFalse(courseId, studentId)
                .orElseThrow(() -> new EntityNotFoundException("Enrollment not found for student: " + studentId));

        List<Lesson> lessons = lessonRepository.findByChapterCourseIdAndDeletedFalseOrderByChapterOrderIndexAscOrderIndexAsc(courseId);
        List<LearningProgress> progressItems = learningProgressRepository
                .findByEnrollmentIdAndDeletedFalseOrderByLessonOrderIndexAsc(enrollment.getId());

        int totalLessons = lessons.size();
        int completedLessons = (int) progressItems.stream()
                .filter(LearningProgress::isCompleted)
                .count();
        Float progress = totalLessons == 0 ? 0F : completedLessons * 100F / totalLessons;

        enrollment.setProgress(progress);
        enrollmentRepository.save(enrollment);

        StudentLearningProgressResponse response = new StudentLearningProgressResponse();
        response.setEnrollmentId(enrollment.getId());
        response.setCourseId(courseId);
        response.setProgress(progress);
        response.setTotalLessons(totalLessons);
        response.setCompletedLessons(completedLessons);
        response.setLessons(progressItems.stream().map(this::toResponse).toList());

        if (enrollment.getStudent() != null) {
            response.setStudentId(enrollment.getStudent().getId());
            response.setStudentName(enrollment.getStudent().getFullName());
            response.setStudentEmail(enrollment.getStudent().getEmail());
        }

        return response;
    }

    private Course getOwnedCourse(Long courseId, User instructor) {
        Course course = courseRepository.findByIdAndDeletedFalse(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + courseId));

        if (course.getInstructor() == null || !course.getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("You are not the instructor of this course");
        }

        return course;
    }

    private LearningProgressResponse toResponse(LearningProgress progress) {
        LearningProgressResponse response = new LearningProgressResponse();
        response.setId(progress.getId());
        response.setEnrollmentId(progress.getEnrollment() != null ? progress.getEnrollment().getId() : null);
        response.setCompleted(progress.isCompleted());
        response.setCompletedAt(progress.getCompletedAt());
        response.setUpdatedAt(progress.getUpdatedAt());

        if (progress.getLesson() != null) {
            response.setLessonId(progress.getLesson().getId());
            response.setLessonTitle(progress.getLesson().getTitle());
            response.setLessonOrderIndex(progress.getLesson().getOrderIndex());
        }

        return response;
    }
}
