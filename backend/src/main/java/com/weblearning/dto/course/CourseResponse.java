package com.weblearning.dto.course;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private Long id;
    private Long categoryId;
    private Long instructorId;
    private String title;
    private String slug;
    private String description;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime upDateTime;
}
