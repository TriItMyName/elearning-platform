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
public class AdminLessonUpdateRequest {

    private Long chapterId;

    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    private Integer lessonType;

    @Size(max = 500, message = "Video URL cannot exceed 500 characters")
    private String videoUrl;

    @Size(max = 500, message = "Document URL cannot exceed 500 characters")
    private String documentUrl;

    private Integer duration;

    private String content;

    private Integer orderIndex;
}
