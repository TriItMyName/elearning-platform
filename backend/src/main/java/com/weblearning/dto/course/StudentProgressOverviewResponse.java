package com.weblearning.dto.course;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProgressOverviewResponse {
    private int totalCourses;
    private int completedCourses;
    private int totalLessons;
    private int completedLessons;
    private Float overallProgress;
    private int totalQuizAttempts;
    private Float averageQuizScore;
    private List<StudentCourseProgressSummaryResponse> courses;
}
