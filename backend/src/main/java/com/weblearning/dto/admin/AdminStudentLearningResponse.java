package com.weblearning.dto.admin;

import com.weblearning.dto.enrollment.EnrollmentResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStudentLearningResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private int enrolledCourses;
    private Float averageProgress;
    private List<EnrollmentResponse> enrollments;
}
