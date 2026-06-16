package com.weblearning.dto.admin;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminChapterUpdateRequest {

    private Long courseId;

    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    private Integer orderIndex;
}
