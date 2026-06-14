package com.weblearning.dto.assignment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeAssignmentSubmissionRequest {

    @NotNull
    @PositiveOrZero
    private Integer score;

    @Size(max = 2000)
    private String feedback;
}
