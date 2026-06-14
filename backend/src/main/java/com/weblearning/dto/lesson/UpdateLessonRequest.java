package com.weblearning.dto.lesson;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLessonRequest {
    @NotBlank
    @Size(max = 150)
    private String title;

    @NotNull
    private Integer lessonType;

    @Size(max = 500)
    private String videoUrl;

    @Size(max = 500)
    private String documentUrl;

    private Integer duration;

    @Size(max = 2000)
    private String content;

    @NotNull
    private Integer orderIndex;
}
