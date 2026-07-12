package com.weblearning.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminLessonDtoResponse {
    private Long id;
    private Long chapterId;
    private String title;
    private Integer lessonType;
    private String videoUrl;
    private String documentUrl;
    private Integer duration;
    private String content;
    private Integer orderIndex;
}
