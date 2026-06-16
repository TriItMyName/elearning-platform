package com.weblearning.dto.quiz;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitQuizRequest {
    @Valid
    @NotEmpty
    private List<SubmitQuizAnswerRequest> answers;
}
