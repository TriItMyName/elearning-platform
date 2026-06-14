package com.weblearning.dto.assignment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssignmentRequest {

    @NotBlank
    @Size(max = 150)
    private String title;

    @Size(max = 2000)
    private String description;

    @Size(max = 500)
    private String attachmentUrl;

    private LocalDateTime deadline;

    @NotNull
    private Integer maxScore;
}
