package com.weblearning.dto.lesson;

import com.weblearning.dto.quiz.QuizResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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
    private List<QuizResponse> quizzes;
}
