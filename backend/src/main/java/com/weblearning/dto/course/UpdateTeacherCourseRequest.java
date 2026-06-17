package com.weblearning.dto.course;

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
public class UpdateTeacherCourseRequest {
    @NotNull
    private Long categoryId;

    @NotBlank
    @Size(max = 100)
    private String title;

    @NotBlank
    @Size(max = 120)
    private String slug;

    @Size(max = 2000)
    private String description;

    @Size(max = 500)
    private String thumbnail;

    private LocalDateTime createdAt;

    public UpdateTeacherCourseRequest(
            Long categoryId,
            String title,
            String slug,
            String description,
            Integer ignoredStatus,
            LocalDateTime createdAt
    ) {
        this.categoryId = categoryId;
        this.title = title;
        this.slug = slug;
        this.description = description;
        this.createdAt = createdAt;
    }
}
