package com.weblearning.dto.quiz;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuestionRequest {

    @NotBlank
    @Size(max = 2000)
    private String content;

    @NotNull
    @Positive
    private Float score;

    @NotNull
    private Integer orderIndex;

    @Valid
    @NotEmpty
    private List<CreateQuestionOptionRequest> options;
}
