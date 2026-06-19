package com.weblearning.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardSummaryResponse {
    private long totalStudents;
    private long totalCourses;
    private long activeEnrollments;
    private int completionRate;
    private long quizAttempts;
    private List<DashboardTopCourseResponse> topCourses;
    private List<DashboardActivityResponse> recentActivity;
    private List<DashboardEnrollmentTrendResponse> enrollmentTrend;
}
