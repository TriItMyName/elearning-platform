package com.weblearning.dto.lesson;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonResponse {
    private Long id;
    private Long chapterId;
    private String title;
    private String slug;
    private Integer lessonType;
    private String videoUrl;
    private String documentUrl;
    private Integer duration;
    private String content;
    private Integer orderIndex;
}
