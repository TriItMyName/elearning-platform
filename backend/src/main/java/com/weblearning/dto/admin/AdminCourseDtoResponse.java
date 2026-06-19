package com.weblearning.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.weblearning.entity.enums.CourseStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminCourseDtoResponse {
    private Long id;
    private Long categoryId;
    private Long instructorId;
    private String instructorName;
    private String title;
    private String slug;
    private String description;
    private String thumbnail;
    private CourseStatus adminStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
