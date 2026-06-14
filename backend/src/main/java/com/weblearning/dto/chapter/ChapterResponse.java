package com.weblearning.dto.chapter;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterResponse {
    private Long id;
    private Long courseId;
    private String title;
    private Integer orderIndex;
}
