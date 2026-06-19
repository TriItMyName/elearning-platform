package com.weblearning.service.impl.admin;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.weblearning.dto.admin.AdminDashboardSummaryResponse;
import com.weblearning.dto.admin.DashboardActivityResponse;
import com.weblearning.dto.admin.DashboardEnrollmentTrendResponse;
import com.weblearning.dto.admin.DashboardTopCourseResponse;
import com.weblearning.entity.Course;
import com.weblearning.entity.Enrollment;
import com.weblearning.entity.LearningProgress;
import com.weblearning.repository.EnrollmentRepository;
import com.weblearning.repository.LearningProgressRepository;
import com.weblearning.repository.QuizAttemptRepository;
import com.weblearning.repository.admin.AdminCourseRepository;
import com.weblearning.repository.admin.UserRepository;
import com.weblearning.service.admin.AdminDashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private static final float COMPLETION_THRESHOLD = 100F;
    private static final int TREND_MONTHS = 7;
    private static final int RECENT_ACTIVITY_LIMIT = 5;
    private static final int TOP_COURSES_LIMIT = 5;

    private final UserRepository userRepository;
    private final AdminCourseRepository adminCourseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final LearningProgressRepository learningProgressRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardSummaryResponse getSummary() {
        long totalStudents = userRepository.countDistinctByRoles_NameIgnoreCase("STUDENT");
        long totalCourses = adminCourseRepository.countByDeletedFalse();
        long activeEnrollments = enrollmentRepository.countByDeletedFalseAndProgressLessThan(COMPLETION_THRESHOLD);
        int completionRate = Math.round(averageProgress(enrollmentRepository.findByDeletedFalse()));
        long quizAttempts = quizAttemptRepository.countByDeletedFalse();

        return AdminDashboardSummaryResponse.builder()
                .totalStudents(totalStudents)
                .totalCourses(totalCourses)
                .activeEnrollments(activeEnrollments)
                .completionRate(completionRate)
                .quizAttempts(quizAttempts)
                .topCourses(buildTopCourses())
                .recentActivity(buildRecentActivity())
                .enrollmentTrend(buildEnrollmentTrend())
                .build();
    }

    private List<DashboardTopCourseResponse> buildTopCourses() {
        Map<Long, List<Enrollment>> byCourse = enrollmentRepository.findByDeletedFalseAndCourse_DeletedFalse().stream()
                .filter(enrollment -> enrollment.getCourse() != null)
                .collect(Collectors.groupingBy(enrollment -> enrollment.getCourse().getId()));

        return byCourse.entrySet().stream()
                .map(entry -> {
                    List<Enrollment> enrollments = entry.getValue();
                    Course course = enrollments.getFirst().getCourse();
                    double avgProgress = enrollments.stream()
                            .mapToDouble(enrollment -> enrollment.getProgress() != null ? enrollment.getProgress() : 0D)
                            .average()
                            .orElse(0D);

                    return DashboardTopCourseResponse.builder()
                            .courseId(course.getId())
                            .title(course.getTitle())
                            .enrollments(enrollments.size())
                            .completionRate((int) Math.round(avgProgress))
                            .build();
                })
                .sorted(Comparator.comparingLong(DashboardTopCourseResponse::getEnrollments).reversed())
                .limit(TOP_COURSES_LIMIT)
                .toList();
    }

    private List<DashboardActivityResponse> buildRecentActivity() {
        List<DashboardActivityResponse> items = new ArrayList<>();

        enrollmentRepository.findByDeletedFalseOrderByEnrolledAtDesc(PageRequest.of(0, 5)).forEach(enrollment -> {
            String studentName = enrollment.getStudent() != null ? enrollment.getStudent().getFullName() : "Học viên";
            String courseTitle = enrollment.getCourse() != null ? enrollment.getCourse().getTitle() : "khóa học";
            items.add(DashboardActivityResponse.builder()
                    .id(enrollment.getId())
                    .type("enrollment")
                    .message(studentName + " ghi danh khóa " + courseTitle)
                    .at(enrollment.getEnrolledAt())
                    .build());
        });

        quizAttemptRepository
                .findByDeletedFalseAndCompletedAtIsNotNullOrderByCompletedAtDesc(PageRequest.of(0, 5))
                .forEach(attempt -> {
                    String studentName = attempt.getStudent() != null ? attempt.getStudent().getFullName() : "Học viên";
                    String lessonTitle = attempt.getQuiz() != null && attempt.getQuiz().getLesson() != null
                            ? attempt.getQuiz().getLesson().getTitle()
                            : "quiz";
                    int score = attempt.getTotalScore() != null ? Math.round(attempt.getTotalScore()) : 0;
                    items.add(DashboardActivityResponse.builder()
                            .id(attempt.getId() + 10_000)
                            .type("quiz")
                            .message(studentName + " hoàn thành quiz \"" + lessonTitle + "\" — " + score + " điểm")
                            .at(attempt.getCompletedAt())
                            .build());
                });

        learningProgressRepository
                .findByCompletedTrueAndDeletedFalseAndCompletedAtIsNotNullOrderByCompletedAtDesc(PageRequest.of(0, 5))
                .forEach(progress -> items.add(toLessonActivity(progress)));

        return items.stream()
                .filter(item -> item.getAt() != null)
                .sorted(Comparator.comparing(DashboardActivityResponse::getAt).reversed())
                .limit(RECENT_ACTIVITY_LIMIT)
                .toList();
    }

    private DashboardActivityResponse toLessonActivity(LearningProgress progress) {
        String studentName = progress.getEnrollment() != null && progress.getEnrollment().getStudent() != null
                ? progress.getEnrollment().getStudent().getFullName()
                : "Học viên";
        String lessonTitle = progress.getLesson() != null ? progress.getLesson().getTitle() : "bài học";
        return DashboardActivityResponse.builder()
                .id(progress.getId() + 20_000)
                .type("lesson")
                .message(studentName + " hoàn thành bài học \"" + lessonTitle + "\"")
                .at(progress.getCompletedAt())
                .build();
    }

    private List<DashboardEnrollmentTrendResponse> buildEnrollmentTrend() {
        YearMonth current = YearMonth.now();
        Map<YearMonth, long[]> buckets = new LinkedHashMap<>();
        for (int i = TREND_MONTHS - 1; i >= 0; i--) {
            buckets.put(current.minusMonths(i), new long[] { 0L, 0L });
        }

        LocalDateTime since = current.minusMonths(TREND_MONTHS - 1).atDay(1).atStartOfDay();
        List<Enrollment> enrollments = enrollmentRepository.findByDeletedFalseAndEnrolledAtGreaterThanEqual(since);

        for (Enrollment enrollment : enrollments) {
            YearMonth month = YearMonth.from(enrollment.getEnrolledAt());
            long[] bucket = buckets.get(month);
            if (bucket == null) {
                continue;
            }
            bucket[0]++;
            if (enrollment.getProgress() != null && enrollment.getProgress() >= COMPLETION_THRESHOLD) {
                bucket[1]++;
            }
        }

        return buckets.entrySet().stream()
                .map(entry -> {
                    long[] values = entry.getValue();
                    return DashboardEnrollmentTrendResponse.builder()
                            .label("T" + entry.getKey().getMonthValue())
                            .enrollments(values[0])
                            .completions(values[1])
                            .build();
                })
                .collect(Collectors.toList());
    }

    private float averageProgress(List<Enrollment> enrollments) {
        if (enrollments.isEmpty()) {
            return 0F;
        }
        return (float) enrollments.stream()
                .mapToDouble(enrollment -> enrollment.getProgress() != null ? enrollment.getProgress() : 0D)
                .average()
                .orElse(0D);
    }
}
