package com.weblearning.dto.course;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {
    private Long enrollmentId;
    private Long courseId;
    private Long studentId;
    private String username;
    private String fullName;
    private String email;
    private Float progress;
    private LocalDateTime enrolledAt;
}
