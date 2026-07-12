package com.weblearning.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptResponse {
    private Long id;
    private Long courseId;
    private Long lessonId;
    private Long quizId;
    private Long studentId;
    private Float totalScore;
    private Float passScore;
    private Boolean passed;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
