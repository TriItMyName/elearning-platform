package com.weblearning.controller;

import com.weblearning.dto.quiz.CreateQuestionOptionRequest;
import com.weblearning.dto.quiz.CreateQuestionRequest;
import com.weblearning.dto.quiz.CreateQuizRequest;
import com.weblearning.dto.quiz.QuestionResponse;
import com.weblearning.dto.quiz.QuizAttemptResponse;
import com.weblearning.dto.quiz.QuizResponse;
import com.weblearning.dto.quiz.SubmitQuizRequest;
import com.weblearning.dto.quiz.UpdateQuestionRequest;
import com.weblearning.dto.quiz.UpdateQuizRequest;
import com.weblearning.entity.Question;
import com.weblearning.entity.QuestionOption;
import com.weblearning.entity.Quiz;
import com.weblearning.entity.User;
import com.weblearning.service.AuthService;
import com.weblearning.service.QuizService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/chapters/{chapterId}/lessons/{lessonId}/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final AuthService authService;

    @GetMapping("/teacher")
    public ResponseEntity<List<QuizResponse>> getByLesson(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.ok(quizService.getByLessonForInstructor(courseId, chapterId, lessonId, instructor));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/student")
    public ResponseEntity<List<QuizResponse>> getByLessonForStudent(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        try {
            User student = getCurrentUser(authentication);
            return ResponseEntity.ok(quizService.getByLessonForStudent(courseId, chapterId, lessonId, student));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/student/{quizId}/questions")
    public ResponseEntity<List<QuestionResponse>> getQuestionsForStudent(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @PathVariable Long quizId,
            Authentication authentication
    ) {
        try {
            User student = getCurrentUser(authentication);
            return ResponseEntity.ok(quizService.getQuestionsForStudent(courseId, chapterId, lessonId, quizId, student));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/student/{quizId}/submit")
    public ResponseEntity<QuizAttemptResponse> submitForStudent(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @PathVariable Long quizId,
            @Valid @RequestBody SubmitQuizRequest request,
            Authentication authentication
    ) {
        try {
            User student = getCurrentUser(authentication);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(quizService.submitForStudent(courseId, chapterId, lessonId, quizId, request, student));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/student/attempts")
    public ResponseEntity<List<QuizAttemptResponse>> getAttemptsForStudent(Authentication authentication) {
        User student = getCurrentUser(authentication);
        return ResponseEntity.ok(quizService.getAttemptsForStudent(student));
    }

    @GetMapping("/student/{quizId}/attempts")
    public ResponseEntity<List<QuizAttemptResponse>> getAttemptsForQuizForStudent(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @PathVariable Long quizId,
            Authentication authentication
    ) {
        try {
            User student = getCurrentUser(authentication);
            return ResponseEntity.ok(
                    quizService.getAttemptsForQuizForStudent(courseId, chapterId, lessonId, quizId, student)
            );
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/teacher")
    public ResponseEntity<QuizResponse> create(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @Valid @RequestBody CreateQuizRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(quizService.createForInstructor(courseId, chapterId, lessonId, toEntity(request), instructor));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/teacher/import-document")
    public ResponseEntity<QuizResponse> importFromDocument(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Integer timeLimit,
            @RequestParam Float passScore,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(quizService.importFromDocumentForInstructor(
                            courseId,
                            chapterId,
                            lessonId,
                            file,
                            timeLimit,
                            passScore,
                            instructor
                    ));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/teacher/{quizId}")
    public ResponseEntity<QuizResponse> update(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @PathVariable Long quizId,
            @Valid @RequestBody UpdateQuizRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.ok(
                    quizService.updateForInstructor(courseId, chapterId, lessonId, quizId, toEntity(request), instructor)
            );
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/teacher/{quizId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @PathVariable Long quizId,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            quizService.deleteForInstructor(courseId, chapterId, lessonId, quizId, instructor);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/teacher/{quizId}/questions")
    public ResponseEntity<List<QuestionResponse>> getQuestions(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @PathVariable Long quizId,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.ok(
                    quizService.getQuestionsForInstructor(courseId, chapterId, lessonId, quizId, instructor)
            );
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/teacher/{quizId}/questions")
    public ResponseEntity<QuestionResponse> createQuestion(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @PathVariable Long quizId,
            @Valid @RequestBody CreateQuestionRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    quizService.createQuestionForInstructor(
                            courseId,
                            chapterId,
                            lessonId,
                            quizId,
                            toEntity(request),
                            toOptions(request.getOptions()),
                            instructor
                    )
            );
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PutMapping("/teacher/{quizId}/questions/{questionId}")
    public ResponseEntity<QuestionResponse> updateQuestion(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @PathVariable Long quizId,
            @PathVariable Long questionId,
            @Valid @RequestBody UpdateQuestionRequest request,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            return ResponseEntity.ok(
                    quizService.updateQuestionForInstructor(
                            courseId,
                            chapterId,
                            lessonId,
                            quizId,
                            questionId,
                            toEntity(request),
                            toOptions(request.getOptions()),
                            instructor
                    )
            );
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/teacher/{quizId}/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long courseId,
            @PathVariable Long chapterId,
            @PathVariable Long lessonId,
            @PathVariable Long quizId,
            @PathVariable Long questionId,
            Authentication authentication
    ) {
        try {
            User instructor = getCurrentUser(authentication);
            quizService.deleteQuestionForInstructor(courseId, chapterId, lessonId, quizId, questionId, instructor);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    private User getCurrentUser(Authentication authentication) {
        return authService.getUserByUserName(authentication.getName());
    }

    private Quiz toEntity(CreateQuizRequest request) {
        Quiz quiz = new Quiz();
        quiz.setTimeLimit(request.getTimeLimit());
        quiz.setPassScore(request.getPassScore());
        return quiz;
    }

    private Quiz toEntity(UpdateQuizRequest request) {
        Quiz quiz = new Quiz();
        quiz.setTimeLimit(request.getTimeLimit());
        quiz.setPassScore(request.getPassScore());
        return quiz;
    }

    private Question toEntity(CreateQuestionRequest request) {
        Question question = new Question();
        question.setContent(request.getContent());
        question.setScore(request.getScore());
        question.setOrderIndex(request.getOrderIndex());
        return question;
    }

    private Question toEntity(UpdateQuestionRequest request) {
        Question question = new Question();
        question.setContent(request.getContent());
        question.setScore(request.getScore());
        question.setOrderIndex(request.getOrderIndex());
        return question;
    }

    private List<QuestionOption> toOptions(List<CreateQuestionOptionRequest> requests) {
        return requests.stream()
                .map(request -> {
                    QuestionOption option = new QuestionOption();
                    option.setContent(request.getContent());
                    option.setIsCorrect(request.getIsCorrect());
                    return option;
                })
                .toList();
    }
}
