package com.weblearning.dto.quiz;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuestionOptionRequest {

    @NotBlank
    @Size(max = 1000)
    private String content;

    @NotNull
    private Boolean isCorrect;
}
