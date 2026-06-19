package com.weblearning.dto.admin;

import com.weblearning.entity.enums.CourseStatus;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCourseUpdateRequest {
    private Long id;
    private Long categoryId;
    private Long instructorId;
    private String title;

    private String description;

    @Size(max = 500)
    private String thumbnail;

    private CourseStatus adminStatus;
}
