package com.weblearning.dto.assignment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssignmentResponse {
    private Long id;
    private Long lessonId;
    private String title;
    private String description;
    private String attachmentUrl;
    private LocalDateTime deadline;
    private Integer maxScore;
    private LocalDateTime createdAt;
}
