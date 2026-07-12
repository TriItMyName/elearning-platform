package com.weblearning.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminChapterDtoResponse {
    private Long id;
    private Long courseId;
    private String title;
    private Integer orderIndex;
}
