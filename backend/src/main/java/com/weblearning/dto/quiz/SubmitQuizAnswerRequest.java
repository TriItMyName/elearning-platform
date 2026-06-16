package com.weblearning.dto.quiz;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitQuizAnswerRequest {
    @NotNull
    private Long questionId;

    @NotNull
    private Long optionId;
}
