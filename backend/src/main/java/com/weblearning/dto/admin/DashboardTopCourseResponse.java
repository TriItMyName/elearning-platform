package com.weblearning.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardTopCourseResponse {
    private Long courseId;
    private String title;
    private long enrollments;
    private int completionRate;
}
