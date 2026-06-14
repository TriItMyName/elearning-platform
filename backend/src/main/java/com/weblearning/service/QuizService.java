package com.weblearning.service;

import com.weblearning.dto.quiz.QuestionResponse;
import com.weblearning.dto.quiz.QuizResponse;
import com.weblearning.entity.Question;
import com.weblearning.entity.QuestionOption;
import com.weblearning.entity.Quiz;
import com.weblearning.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface QuizService {
    List<QuizResponse> getByLessonForInstructor(Long courseId, Long chapterId, Long lessonId, User instructor);

    QuizResponse createForInstructor(Long courseId, Long chapterId, Long lessonId, Quiz quiz, User instructor);

    QuizResponse importFromDocumentForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            MultipartFile file,
            Integer timeLimit,
            Float passScore,
            User instructor
    );

    QuizResponse updateForInstructor(Long courseId, Long chapterId, Long lessonId, Long quizId, Quiz quiz, User instructor);

    void deleteForInstructor(Long courseId, Long chapterId, Long lessonId, Long quizId, User instructor);

    List<QuestionResponse> getQuestionsForInstructor(Long courseId, Long chapterId, Long lessonId, Long quizId, User instructor);

    QuestionResponse createQuestionForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long quizId,
            Question question,
            List<QuestionOption> options,
            User instructor
    );

    QuestionResponse updateQuestionForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long quizId,
            Long questionId,
            Question question,
            List<QuestionOption> options,
            User instructor
    );

    void deleteQuestionForInstructor(Long courseId, Long chapterId, Long lessonId, Long quizId, Long questionId, User instructor);
}
