package com.weblearning.dto.course;

import com.weblearning.dto.lesson.LessonResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterContentResponse {
    private Long id;
    private Long courseId;
    private String title;
    private String slug;
    private Integer orderIndex;
    private List<LessonResponse> lessons;
}
