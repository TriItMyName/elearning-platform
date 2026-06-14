package com.weblearning.dto.assignment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentSubmissionResponse {
    private Long id;
    private Long assignmentId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String content;
    private String attachmentUrl;
    private LocalDateTime submittedAt;
    private Integer score;
    private String feedback;
    private LocalDateTime gradedAt;
    private Long gradedById;
    private String gradedByName;
}
