package com.weblearning.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStudentOverviewResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private int enrolledCourses;
    private Float averageProgress;
    private LocalDateTime lastEnrolledAt;
}
