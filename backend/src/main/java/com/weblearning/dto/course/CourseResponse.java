package com.weblearning.dto.course;

import com.weblearning.entity.enums.CourseStatus;
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
    private String thumbnail;
    private Integer status;
    private CourseStatus adminStatus;
    private LocalDateTime createdAt;
    private LocalDateTime upDateTime;
    private Boolean enrolled;
}
