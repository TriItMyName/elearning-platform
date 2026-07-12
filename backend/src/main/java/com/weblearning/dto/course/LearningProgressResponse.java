package com.weblearning.dto.course;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningProgressResponse {
    private Long id;
    private Long enrollmentId;
    private Long lessonId;
    private String lessonTitle;
    private Integer lessonOrderIndex;
    private boolean completed;
    private LocalDateTime completedAt;
    private LocalDateTime updatedAt;
}
