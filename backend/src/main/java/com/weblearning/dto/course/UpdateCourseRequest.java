package com.weblearning.dto.course;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCourseRequest {

    private Long categoryId;
    private Long instructorId;
    private String title;
    private String slug;
    private String description;
    private String thumbnail;
    private Integer status;
    private LocalDateTime createdAt;

    public UpdateCourseRequest(
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
