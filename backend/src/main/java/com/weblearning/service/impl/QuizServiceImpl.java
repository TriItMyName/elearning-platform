package com.weblearning.service.impl;

import com.weblearning.dto.quiz.QuestionOptionResponse;
import com.weblearning.dto.quiz.QuestionResponse;
import com.weblearning.dto.quiz.QuizResponse;
import com.weblearning.entity.Chapter;
import com.weblearning.entity.Lesson;
import com.weblearning.entity.Question;
import com.weblearning.entity.QuestionOption;
import com.weblearning.entity.Quiz;
import com.weblearning.entity.User;
import com.weblearning.repository.ChapterRepository;
import com.weblearning.repository.LessonRepository;
import com.weblearning.repository.QuestionOptionRepository;
import com.weblearning.repository.QuestionRepository;
import com.weblearning.repository.QuizRepository;
import com.weblearning.service.QuizService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;

    @Override
    public List<QuizResponse> getByLessonForInstructor(Long courseId, Long chapterId, Long lessonId, User instructor) {
        getOwnedLesson(courseId, chapterId, lessonId, instructor);
        return quizRepository.findByLessonIdAndDeletedFalseOrderByCreatedAtDesc(lessonId)
                .stream()
                .map(this::toQuizResponse)
                .toList();
    }

    @Override
    public QuizResponse createForInstructor(Long courseId, Long chapterId, Long lessonId, Quiz quiz, User instructor) {
        Lesson lesson = getOwnedLesson(courseId, chapterId, lessonId, instructor);

        quiz.setLesson(lesson);
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setDeleted(false);

        return toQuizResponse(quizRepository.save(quiz));
    }

    @Override
    public QuizResponse updateForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long quizId,
            Quiz quiz,
            User instructor
    ) {
        getOwnedLesson(courseId, chapterId, lessonId, instructor);
        Quiz existing = getQuizInLesson(lessonId, quizId);

        existing.setTimeLimit(quiz.getTimeLimit());
        existing.setPassScore(quiz.getPassScore());

        return toQuizResponse(quizRepository.save(existing));
    }

    @Override
    public void deleteForInstructor(Long courseId, Long chapterId, Long lessonId, Long quizId, User instructor) {
        getOwnedLesson(courseId, chapterId, lessonId, instructor);
        Quiz quiz = getQuizInLesson(lessonId, quizId);

        quiz.setDeleted(true);
        quiz.setDeletedAt(LocalDateTime.now());
        quizRepository.save(quiz);
    }

    @Override
    public List<QuestionResponse> getQuestionsForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long quizId,
            User instructor
    ) {
        getOwnedLesson(courseId, chapterId, lessonId, instructor);
        getQuizInLesson(lessonId, quizId);

        return questionRepository.findByQuizIdAndDeletedFalseOrderByOrderIndexAsc(quizId)
                .stream()
                .map(this::toQuestionResponse)
                .toList();
    }

    @Override
    public QuestionResponse createQuestionForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long quizId,
            Question question,
            List<QuestionOption> options,
            User instructor
    ) {
        getOwnedLesson(courseId, chapterId, lessonId, instructor);
        Quiz quiz = getQuizInLesson(lessonId, quizId);

        question.setQuiz(quiz);
        question.setDeleted(false);
        Question savedQuestion = questionRepository.save(question);
        saveOptions(savedQuestion, options);

        return toQuestionResponse(savedQuestion);
    }

    @Override
    public QuestionResponse updateQuestionForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long quizId,
            Long questionId,
            Question question,
            List<QuestionOption> options,
            User instructor
    ) {
        getOwnedLesson(courseId, chapterId, lessonId, instructor);
        getQuizInLesson(lessonId, quizId);
        Question existing = getQuestionInQuiz(quizId, questionId);

        existing.setContent(question.getContent());
        existing.setScore(question.getScore());
        existing.setOrderIndex(question.getOrderIndex());
        Question savedQuestion = questionRepository.save(existing);

        softDeleteOptions(savedQuestion.getId());
        saveOptions(savedQuestion, options);

        return toQuestionResponse(savedQuestion);
    }

    @Override
    public void deleteQuestionForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long quizId,
            Long questionId,
            User instructor
    ) {
        getOwnedLesson(courseId, chapterId, lessonId, instructor);
        getQuizInLesson(lessonId, quizId);
        Question question = getQuestionInQuiz(quizId, questionId);

        question.setDeleted(true);
        question.setDeletedAt(LocalDateTime.now());
        questionRepository.save(question);
        softDeleteOptions(questionId);
    }

    private void saveOptions(Question question, List<QuestionOption> options) {
        options.forEach(option -> {
            option.setQuestion(question);
            option.setDeleted(false);
        });
        questionOptionRepository.saveAll(options);
    }

    private void softDeleteOptions(Long questionId) {
        List<QuestionOption> options = questionOptionRepository.findByQuestionIdAndDeletedFalseOrderByIdAsc(questionId);
        options.forEach(option -> {
            option.setDeleted(true);
            option.setDeletedAt(LocalDateTime.now());
        });
        questionOptionRepository.saveAll(options);
    }

    private Quiz getQuizInLesson(Long lessonId, Long quizId) {
        Quiz quiz = quizRepository.findByIdAndDeletedFalse(quizId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz not found: " + quizId));

        if (quiz.getLesson() == null || !quiz.getLesson().getId().equals(lessonId)) {
            throw new EntityNotFoundException("Quiz not found in lesson: " + lessonId);
        }

        return quiz;
    }

    private Question getQuestionInQuiz(Long quizId, Long questionId) {
        Question question = questionRepository.findByIdAndDeletedFalse(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Question not found: " + questionId));

        if (question.getQuiz() == null || !question.getQuiz().getId().equals(quizId)) {
            throw new EntityNotFoundException("Question not found in quiz: " + quizId);
        }

        return question;
    }

    private Lesson getOwnedLesson(Long courseId, Long chapterId, Long lessonId, User instructor) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new EntityNotFoundException("Lesson not found: " + lessonId));

        if (lesson.getChapter() == null || !lesson.getChapter().getId().equals(chapterId)) {
            throw new EntityNotFoundException("Lesson not found in chapter: " + chapterId);
        }

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new EntityNotFoundException("Chapter not found: " + chapterId));

        if (chapter.getCourse() == null || !chapter.getCourse().getId().equals(courseId)) {
            throw new EntityNotFoundException("Chapter not found in course: " + courseId);
        }

        if (chapter.getCourse().getInstructor() == null
                || !chapter.getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("You are not the instructor of this course");
        }

        return lesson;
    }

    private QuizResponse toQuizResponse(Quiz quiz) {
        QuizResponse response = new QuizResponse();
        response.setId(quiz.getId());
        response.setLessonId(quiz.getLesson() != null ? quiz.getLesson().getId() : null);
        response.setTimeLimit(quiz.getTimeLimit());
        response.setPassScore(quiz.getPassScore());
        response.setCreatedAt(quiz.getCreatedAt());
        return response;
    }

    private QuestionResponse toQuestionResponse(Question question) {
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setQuizId(question.getQuiz() != null ? question.getQuiz().getId() : null);
        response.setContent(question.getContent());
        response.setScore(question.getScore());
        response.setOrderIndex(question.getOrderIndex());
        response.setOptions(questionOptionRepository.findByQuestionIdAndDeletedFalseOrderByIdAsc(question.getId())
                .stream()
                .map(this::toOptionResponse)
                .toList());
        return response;
    }

    private QuestionOptionResponse toOptionResponse(QuestionOption option) {
        QuestionOptionResponse response = new QuestionOptionResponse();
        response.setId(option.getId());
        response.setContent(option.getContent());
        response.setIsCorrect(option.getIsCorrect());
        return response;
    }
}
