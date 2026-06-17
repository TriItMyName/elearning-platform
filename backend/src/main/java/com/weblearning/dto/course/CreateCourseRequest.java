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
public class CreateCourseRequest {
    @NotNull
    private Long categoryId;

    @NotNull
    private Long instructorId;

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

    @NotNull
    private Integer status;

    private LocalDateTime createdAt;

    public CreateCourseRequest(
            Long categoryId,
            Long instructorId,
            String title,
            String slug,
            String description,
            Integer status,
            LocalDateTime createdAt
    ) {
        this.categoryId = categoryId;
        this.instructorId = instructorId;
        this.title = title;
        this.slug = slug;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
    }
}

