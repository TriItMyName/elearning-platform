package com.weblearning.dto.admin;

import com.weblearning.entity.enums.CourseStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCourseRequest {

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Instructor is required")
    private Long instructorId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @Size(max = 500)
    private String thumbnail;

    private CourseStatus adminStatus;
}
