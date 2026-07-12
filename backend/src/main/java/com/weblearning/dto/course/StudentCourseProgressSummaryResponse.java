package com.weblearning.dto.course;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentCourseProgressSummaryResponse {
    private Long courseId;
    private String courseTitle;
    private String courseSlug;
    private String thumbnail;
    private int totalLessons;
    private int completedLessons;
    private Float progress;
    private int quizAttempts;
    private int passedQuizAttempts;
    private Float averageQuizScore;
    private LocalDateTime lastActivityAt;
}
