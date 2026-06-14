package com.weblearning.dto.course;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentLearningProgressResponse {
    private Long enrollmentId;
    private Long courseId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private int totalLessons;
    private int completedLessons;
    private Float progress;
    private List<LearningProgressResponse> lessons;
}
