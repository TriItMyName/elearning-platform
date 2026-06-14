package com.weblearning.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizResponse {
    private Long id;
    private Long lessonId;
    private Integer timeLimit;
    private Float passScore;
    private LocalDateTime createdAt;
}
