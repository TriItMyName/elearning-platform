package com.weblearning.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private Long id;
    private Long quizId;
    private String content;
    private Float score;
    private Integer orderIndex;
    private List<QuestionOptionResponse> options;
}
