package com.weblearning.service.impl;

import com.weblearning.dto.course.LearningProgressResponse;
import com.weblearning.dto.course.StudentCourseProgressSummaryResponse;
import com.weblearning.dto.course.StudentLearningProgressResponse;
import com.weblearning.dto.course.StudentProgressOverviewResponse;
import com.weblearning.entity.Course;
import com.weblearning.entity.Enrollment;
import com.weblearning.entity.LearningProgress;
import com.weblearning.entity.Lesson;
import com.weblearning.entity.QuizAttempt;
import com.weblearning.entity.User;
import com.weblearning.repository.CourseRepository;
import com.weblearning.repository.EnrollmentRepository;
import com.weblearning.repository.LearningProgressRepository;
import com.weblearning.repository.LessonRepository;
import com.weblearning.repository.QuizAttemptRepository;
import com.weblearning.service.LearningProgressService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningProgressServiceImpl implements LearningProgressService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final LearningProgressRepository learningProgressRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    @Override
    public StudentLearningProgressResponse getStudentProgressForInstructor(Long courseId, Long studentId, User instructor) {
        getOwnedCourse(courseId, instructor);
        Enrollment enrollment = enrollmentRepository.findByCourseIdAndStudentIdAndDeletedFalse(courseId, studentId)
                .orElseThrow(() -> new EntityNotFoundException("Enrollment not found for student: " + studentId));

        return buildProgressResponse(courseId, enrollment);
    }

    @Override
    public StudentLearningProgressResponse getStudentProgressForStudent(Long courseId, User student) {
        Enrollment enrollment = enrollmentRepository.findByCourseIdAndStudentIdAndDeletedFalse(courseId, student.getId())
                .orElseThrow(() -> new EntityNotFoundException("Enrollment not found for course: " + courseId));

        return buildProgressResponse(courseId, enrollment);
    }

    @Override
    public StudentProgressOverviewResponse getProgressOverviewForStudent(User student) {
        List<Enrollment> enrollments = enrollmentRepository
                .findByStudentIdAndDeletedFalseOrderByEnrolledAtDesc(student.getId())
                .stream()
                .filter(enrollment -> enrollment.getCourse() != null && !enrollment.getCourse().isDeleted())
                .toList();
        List<QuizAttempt> attempts = quizAttemptRepository
                .findByStudentIdAndDeletedFalseOrderByStartedAtDesc(student.getId());
        Map<Long, List<QuizAttempt>> attemptsByCourse = attempts.stream()
                .filter(attempt -> getAttemptCourseId(attempt) != null)
                .collect(Collectors.groupingBy(this::getAttemptCourseId));

        List<StudentCourseProgressSummaryResponse> courses = enrollments.stream()
                .map(enrollment -> buildCourseSummary(
                        enrollment,
                        attemptsByCourse.getOrDefault(enrollment.getCourse().getId(), List.of())
                ))
                .sorted(Comparator.comparing(
                        StudentCourseProgressSummaryResponse::getLastActivityAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .toList();

        int totalLessons = courses.stream().mapToInt(StudentCourseProgressSummaryResponse::getTotalLessons).sum();
        int completedLessons = courses.stream().mapToInt(StudentCourseProgressSummaryResponse::getCompletedLessons).sum();
        int completedCourses = (int) courses.stream().filter(course -> course.getProgress() >= 100F).count();
        int totalQuizAttempts = courses.stream().mapToInt(StudentCourseProgressSummaryResponse::getQuizAttempts).sum();
        Float overallProgress = totalLessons == 0 ? 0F : completedLessons * 100F / totalLessons;
        Float averageQuizScore = totalQuizAttempts == 0
                ? 0F
                : (float) attempts.stream()
                        .filter(attempt -> attempt.getTotalScore() != null)
                        .mapToDouble(QuizAttempt::getTotalScore)
                        .average()
                        .orElse(0D);

        StudentProgressOverviewResponse response = new StudentProgressOverviewResponse();
        response.setTotalCourses(courses.size());
        response.setCompletedCourses(completedCourses);
        response.setTotalLessons(totalLessons);
        response.setCompletedLessons(completedLessons);
        response.setOverallProgress(overallProgress);
        response.setTotalQuizAttempts(totalQuizAttempts);
        response.setAverageQuizScore(averageQuizScore);
        response.setCourses(courses);
        return response;
    }

    @Override
    public StudentLearningProgressResponse completeLessonForStudent(Long courseId, Long lessonId, User student) {
        Enrollment enrollment = enrollmentRepository.findByCourseIdAndStudentIdAndDeletedFalse(courseId, student.getId())
                .orElseThrow(() -> new EntityNotFoundException("Enrollment not found for course: " + courseId));
        Lesson lesson = lessonRepository.findByIdAndDeletedFalse(lessonId)
                .orElseThrow(() -> new EntityNotFoundException("Lesson not found: " + lessonId));

        if (lesson.getChapter() == null
                || lesson.getChapter().getCourse() == null
                || !lesson.getChapter().getCourse().getId().equals(courseId)) {
            throw new SecurityException("Lesson does not belong to this course");
        }

        LearningProgress progress = learningProgressRepository
                .findByEnrollmentIdAndLessonIdAndDeletedFalse(enrollment.getId(), lessonId)
                .orElseGet(() -> {
                    LearningProgress item = new LearningProgress();
                    item.setEnrollment(enrollment);
                    item.setLesson(lesson);
                    item.setDeleted(false);
                    return item;
                });

        LocalDateTime now = LocalDateTime.now();
        progress.setCompleted(true);
        progress.setCompletedAt(progress.getCompletedAt() != null ? progress.getCompletedAt() : now);
        progress.setUpdatedAt(now);
        learningProgressRepository.save(progress);

        return buildProgressResponse(courseId, enrollment);
    }

    private StudentLearningProgressResponse buildProgressResponse(Long courseId, Enrollment enrollment) {
        List<Lesson> lessons = lessonRepository.findByChapterCourseIdAndDeletedFalseOrderByChapterOrderIndexAscOrderIndexAsc(courseId);
        List<LearningProgress> progressItems = learningProgressRepository
                .findByEnrollmentIdAndDeletedFalseOrderByLessonOrderIndexAsc(enrollment.getId());
        Map<Long, LearningProgress> progressByLessonId = progressItems.stream()
                .filter(item -> item.getLesson() != null)
                .collect(Collectors.toMap(item -> item.getLesson().getId(), item -> item, (first, second) -> first));

        int totalLessons = lessons.size();
        int completedLessons = (int) lessons.stream()
                .map(Lesson::getId)
                .map(progressByLessonId::get)
                .filter(item -> item != null && item.isCompleted())
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
        response.setLessons(lessons.stream()
                .map(lesson -> toResponse(lesson, progressByLessonId.get(lesson.getId()), enrollment))
                .toList());

        if (enrollment.getStudent() != null) {
            response.setStudentId(enrollment.getStudent().getId());
            response.setStudentName(enrollment.getStudent().getFullName());
            response.setStudentEmail(enrollment.getStudent().getEmail());
        }

        return response;
    }

    private StudentCourseProgressSummaryResponse buildCourseSummary(
            Enrollment enrollment,
            List<QuizAttempt> attempts
    ) {
        Course course = enrollment.getCourse();
        List<Lesson> lessons = lessonRepository
                .findByChapterCourseIdAndDeletedFalseOrderByChapterOrderIndexAscOrderIndexAsc(course.getId());
        List<LearningProgress> progressItems = learningProgressRepository
                .findByEnrollmentIdAndDeletedFalseOrderByLessonOrderIndexAsc(enrollment.getId());

        int totalLessons = lessons.size();
        int completedLessons = (int) progressItems.stream()
                .filter(LearningProgress::isCompleted)
                .count();
        Float progress = totalLessons == 0 ? 0F : completedLessons * 100F / totalLessons;
        int passedAttempts = (int) attempts.stream().filter(this::isPassedAttempt).count();
        Float averageQuizScore = attempts.isEmpty()
                ? 0F
                : (float) attempts.stream()
                        .filter(attempt -> attempt.getTotalScore() != null)
                        .mapToDouble(QuizAttempt::getTotalScore)
                        .average()
                        .orElse(0D);

        LocalDateTime lastActivityAt = enrollment.getEnrolledAt();
        for (LearningProgress item : progressItems) {
            if (item.getUpdatedAt() != null
                    && (lastActivityAt == null || item.getUpdatedAt().isAfter(lastActivityAt))) {
                lastActivityAt = item.getUpdatedAt();
            }
        }
        for (QuizAttempt attempt : attempts) {
            LocalDateTime activityAt = attempt.getCompletedAt() != null
                    ? attempt.getCompletedAt()
                    : attempt.getStartedAt();
            if (activityAt != null && (lastActivityAt == null || activityAt.isAfter(lastActivityAt))) {
                lastActivityAt = activityAt;
            }
        }

        StudentCourseProgressSummaryResponse response = new StudentCourseProgressSummaryResponse();
        response.setCourseId(course.getId());
        response.setCourseTitle(course.getTitle());
        response.setCourseSlug(course.getSlug());
        response.setThumbnail(course.getThumbnail());
        response.setTotalLessons(totalLessons);
        response.setCompletedLessons(completedLessons);
        response.setProgress(progress);
        response.setQuizAttempts(attempts.size());
        response.setPassedQuizAttempts(passedAttempts);
        response.setAverageQuizScore(averageQuizScore);
        response.setLastActivityAt(lastActivityAt);
        return response;
    }

    private Long getAttemptCourseId(QuizAttempt attempt) {
        if (attempt.getQuiz() == null
                || attempt.getQuiz().getLesson() == null
                || attempt.getQuiz().getLesson().getChapter() == null
                || attempt.getQuiz().getLesson().getChapter().getCourse() == null) {
            return null;
        }
        return attempt.getQuiz().getLesson().getChapter().getCourse().getId();
    }

    private boolean isPassedAttempt(QuizAttempt attempt) {
        return attempt.getQuiz() != null
                && attempt.getQuiz().getPassScore() != null
                && attempt.getTotalScore() != null
                && attempt.getTotalScore() >= attempt.getQuiz().getPassScore();
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

    private LearningProgressResponse toResponse(Lesson lesson, LearningProgress progress, Enrollment enrollment) {
        if (progress != null) {
            return toResponse(progress);
        }

        LearningProgressResponse response = new LearningProgressResponse();
        response.setEnrollmentId(enrollment.getId());
        response.setLessonId(lesson.getId());
        response.setLessonTitle(lesson.getTitle());
        response.setLessonOrderIndex(lesson.getOrderIndex());
        response.setCompleted(false);
        return response;
    }
}
