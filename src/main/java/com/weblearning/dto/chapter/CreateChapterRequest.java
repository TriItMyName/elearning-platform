package com.weblearning.dto.chapter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateChapterRequest {
    @NotBlank
    @Size(max = 150)
    private String title;

    @NotNull
    private Integer orderIndex;
}
