package com.weblearning.service.impl;

import com.weblearning.dto.quiz.QuestionOptionResponse;
import com.weblearning.dto.quiz.QuestionResponse;
import com.weblearning.dto.quiz.QuizAttemptResponse;
import com.weblearning.dto.quiz.QuizResponse;
import com.weblearning.dto.quiz.SubmitQuizAnswerRequest;
import com.weblearning.dto.quiz.SubmitQuizRequest;
import com.weblearning.entity.Chapter;
import com.weblearning.entity.Lesson;
import com.weblearning.entity.Question;
import com.weblearning.entity.QuestionOption;
import com.weblearning.entity.Quiz;
import com.weblearning.entity.QuizAttempt;
import com.weblearning.entity.User;
import com.weblearning.repository.ChapterRepository;
import com.weblearning.repository.EnrollmentRepository;
import com.weblearning.repository.LessonRepository;
import com.weblearning.repository.QuestionOptionRepository;
import com.weblearning.repository.QuestionRepository;
import com.weblearning.repository.QuizAttemptRepository;
import com.weblearning.repository.QuizRepository;
import com.weblearning.service.QuizService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Override
    public List<QuizResponse> getByLessonForInstructor(Long courseId, Long chapterId, Long lessonId, User instructor) {
        getOwnedLesson(courseId, chapterId, lessonId, instructor);
        return quizRepository.findByLessonIdAndDeletedFalseOrderByCreatedAtDesc(lessonId)
                .stream()
                .map(this::toQuizResponse)
                .toList();
    }

    @Override
    public List<QuizResponse> getByLessonForStudent(Long courseId, Long chapterId, Long lessonId, User student) {
        getEnrolledLesson(courseId, chapterId, lessonId, student);
        return quizRepository.findByLessonIdAndDeletedFalseOrderByCreatedAtDesc(lessonId)
                .stream()
                .map(this::toQuizResponse)
                .toList();
    }

    @Override
    public List<QuestionResponse> getQuestionsForStudent(Long courseId, Long chapterId, Long lessonId, Long quizId, User student) {
        getEnrolledLesson(courseId, chapterId, lessonId, student);
        getQuizInLesson(lessonId, quizId);

        return questionRepository.findByQuizIdAndDeletedFalseOrderByOrderIndexAsc(quizId)
                .stream()
                .map(this::toQuestionResponseForStudent)
                .toList();
    }

    @Override
    public QuizAttemptResponse submitForStudent(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long quizId,
            SubmitQuizRequest request,
            User student
    ) {
        getEnrolledLesson(courseId, chapterId, lessonId, student);
        Quiz quiz = getQuizInLesson(lessonId, quizId);

        List<Question> questions = questionRepository.findByQuizIdAndDeletedFalseOrderByOrderIndexAsc(quizId);
        Map<Long, Question> questionById = questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        Float totalScore = 0F;
        for (SubmitQuizAnswerRequest answer : request.getAnswers()) {
            Question question = questionById.get(answer.getQuestionId());
            if (question == null) {
                throw new IllegalArgumentException("Question does not belong to this quiz: " + answer.getQuestionId());
            }

            QuestionOption selectedOption = questionOptionRepository.findById(answer.getOptionId())
                    .orElseThrow(() -> new IllegalArgumentException("Option not found: " + answer.getOptionId()));

            if (selectedOption.isDeleted()
                    || selectedOption.getQuestion() == null
                    || !selectedOption.getQuestion().getId().equals(question.getId())) {
                throw new IllegalArgumentException("Option does not belong to question: " + answer.getQuestionId());
            }

            if (Boolean.TRUE.equals(selectedOption.getIsCorrect())) {
                totalScore += question.getScore();
            }
        }

        LocalDateTime now = LocalDateTime.now();
        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setStudent(student);
        attempt.setTotalScore(totalScore);
        attempt.setStartedAt(now);
        attempt.setCompletedAt(now);
        attempt.setDeleted(false);

        return toQuizAttemptResponse(quizAttemptRepository.save(attempt));
    }

    @Override
    public List<QuizAttemptResponse> getAttemptsForStudent(User student) {
        return quizAttemptRepository.findByStudentIdAndDeletedFalseOrderByStartedAtDesc(student.getId())
                .stream()
                .map(this::toQuizAttemptResponse)
                .toList();
    }

    @Override
    public List<QuizAttemptResponse> getAttemptsForQuizForStudent(
            Long courseId,
            Long chapterId,
            Long lessonId,
            Long quizId,
            User student
    ) {
        getEnrolledLesson(courseId, chapterId, lessonId, student);
        getQuizInLesson(lessonId, quizId);

        return quizAttemptRepository.findByQuizIdAndStudentIdAndDeletedFalseOrderByStartedAtDesc(quizId, student.getId())
                .stream()
                .map(this::toQuizAttemptResponse)
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
    public QuizResponse importFromDocumentForInstructor(
            Long courseId,
            Long chapterId,
            Long lessonId,
            MultipartFile file,
            Integer timeLimit,
            Float passScore,
            User instructor
    ) {
        Lesson lesson = getOwnedLesson(courseId, chapterId, lessonId, instructor);
        validateImportFile(file);

        Quiz quiz = new Quiz();
        quiz.setLesson(lesson);
        quiz.setTimeLimit(timeLimit);
        quiz.setPassScore(passScore);
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setDeleted(false);
        Quiz savedQuiz = quizRepository.save(quiz);

        List<ImportedQuestion> importedQuestions = parseQuestions(extractText(file));
        for (ImportedQuestion importedQuestion : importedQuestions) {
            Question question = new Question();
            question.setQuiz(savedQuiz);
            question.setContent(importedQuestion.content());
            question.setScore(importedQuestion.score());
            question.setOrderIndex(importedQuestion.orderIndex());
            question.setDeleted(false);
            Question savedQuestion = questionRepository.save(question);

            List<QuestionOption> options = importedQuestion.options().stream()
                    .map(importedOption -> {
                        QuestionOption option = new QuestionOption();
                        option.setQuestion(savedQuestion);
                        option.setContent(importedOption.content());
                        option.setIsCorrect(importedOption.correct());
                        option.setDeleted(false);
                        return option;
                    })
                    .toList();
            questionOptionRepository.saveAll(options);
        }

        return toQuizResponse(savedQuiz);
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

    private void validateImportFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IllegalArgumentException("File name is required");
        }

        String lowerFilename = filename.toLowerCase(Locale.ROOT);
        if (!lowerFilename.endsWith(".docx") && !lowerFilename.endsWith(".txt")) {
            throw new IllegalArgumentException("Quiz import file must be .docx or .txt");
        }
    }

    private String extractText(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename != null && filename.toLowerCase(Locale.ROOT).endsWith(".txt")) {
            try {
                return new String(file.getBytes(), StandardCharsets.UTF_8);
            } catch (IOException ex) {
                throw new RuntimeException("Could not read uploaded file", ex);
            }
        }

        try (ZipInputStream zipInputStream = new ZipInputStream(file.getInputStream())) {
            ZipEntry entry;
            while ((entry = zipInputStream.getNextEntry()) != null) {
                if ("word/document.xml".equals(entry.getName())) {
                    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                    zipInputStream.transferTo(outputStream);
                    return toPlainText(outputStream.toString(StandardCharsets.UTF_8));
                }
            }
        } catch (IOException ex) {
            throw new RuntimeException("Could not read uploaded file", ex);
        }

        throw new IllegalArgumentException("Could not read document content");
    }

    private String toPlainText(String xml) {
        String withLineBreaks = xml
                .replaceAll("</w:p>", "\n")
                .replaceAll("</w:tr>", "\n")
                .replaceAll("</w:tc>", "\t");
        String withoutTags = withLineBreaks.replaceAll("<[^>]+>", "");
        return withoutTags
                .replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&quot;", "\"")
                .replace("&apos;", "'")
                .replace('\t', ' ')
                .trim();
    }

    private List<ImportedQuestion> parseQuestions(String text) {
        List<ImportedQuestion> questions = new ArrayList<>();
        ImportedQuestionBuilder current = null;
        int orderIndex = 1;

        for (String rawLine : text.split("\\R")) {
            String line = rawLine.trim();
            if (line.isEmpty()) {
                continue;
            }

            Matcher numberedQuestionMatcher = Pattern.compile("^\\d+\\s*[\\).:-]\\s*(.+)$").matcher(line);
            if (numberedQuestionMatcher.matches()) {
                if (current != null) {
                    questions.add(current.build());
                }
                current = new ImportedQuestionBuilder(orderIndex++, numberedQuestionMatcher.group(1).trim());
                continue;
            }

            if (startsWithAny(line, "Q:", "QUESTION:", "Câu hỏi:", "Cau hoi:")) {
                if (current != null) {
                    questions.add(current.build());
                }
                current = new ImportedQuestionBuilder(orderIndex++, removePrefix(line));
                continue;
            }

            if (current == null) {
                continue;
            }

            if (startsWithAny(line, "SCORE:", "Điểm:", "Diem:")) {
                current.score(parseScore(removePrefix(line)));
                continue;
            }

            if (startsWithAny(line, "ANSWER:", "Đáp án:", "Dap an:")) {
                current.correctAnswer(removePrefix(line));
                continue;
            }

            Matcher optionMatcher = Pattern.compile("^([A-Za-z])\\s*[\\).:-]\\s*(.+)$").matcher(line);
            if (optionMatcher.matches()) {
                current.option(optionMatcher.group(1), optionMatcher.group(2));
            }
        }

        if (current != null) {
            questions.add(current.build());
        }

        if (questions.isEmpty()) {
            throw new IllegalArgumentException("Document must contain at least one question");
        }

        return questions;
    }

    private boolean startsWithAny(String value, String... prefixes) {
        String lowerValue = value.toLowerCase(Locale.ROOT);
        for (String prefix : prefixes) {
            if (lowerValue.startsWith(prefix.toLowerCase(Locale.ROOT))) {
                return true;
            }
        }
        return false;
    }

    private String removePrefix(String value) {
        int index = value.indexOf(':');
        return index >= 0 ? value.substring(index + 1).trim() : value.trim();
    }

    private Float parseScore(String value) {
        try {
            return Float.parseFloat(value.trim());
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Question score must be a number");
        }
    }

    private record ImportedQuestion(String content, Float score, Integer orderIndex, List<ImportedOption> options) {
    }

    private record ImportedOption(String label, String content, boolean correct) {
    }

    private static class ImportedQuestionBuilder {
        private final Integer orderIndex;
        private final String content;
        private final List<ImportedOption> options = new ArrayList<>();
        private Float score = 1F;
        private String correctAnswer;

        private ImportedQuestionBuilder(Integer orderIndex, String content) {
            this.orderIndex = orderIndex;
            this.content = content;
        }

        private void option(String label, String content) {
            options.add(new ImportedOption(label.toUpperCase(Locale.ROOT), content, false));
        }

        private void score(Float score) {
            this.score = score;
        }

        private void correctAnswer(String correctAnswer) {
            this.correctAnswer = correctAnswer.trim().toUpperCase(Locale.ROOT);
        }

        private ImportedQuestion build() {
            if (content == null || content.isBlank()) {
                throw new IllegalArgumentException("Question content is required");
            }
            if (options.size() < 2) {
                throw new IllegalArgumentException("Each question must have at least two options");
            }
            if (correctAnswer == null || correctAnswer.isBlank()) {
                throw new IllegalArgumentException("Each question must have an answer");
            }

            List<ImportedOption> resolvedOptions = options.stream()
                    .map(option -> new ImportedOption(option.label(), option.content(), correctAnswer.contains(option.label())))
                    .toList();

            boolean hasCorrectAnswer = resolvedOptions.stream().anyMatch(ImportedOption::correct);
            if (!hasCorrectAnswer) {
                throw new IllegalArgumentException("Answer does not match any option");
            }

            return new ImportedQuestion(content, score, orderIndex, resolvedOptions);
        }
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

    private Lesson getEnrolledLesson(Long courseId, Long chapterId, Long lessonId, User student) {
        Lesson lesson = lessonRepository.findByIdAndDeletedFalse(lessonId)
                .orElseThrow(() -> new EntityNotFoundException("Lesson not found: " + lessonId));

        if (lesson.getChapter() == null || !lesson.getChapter().getId().equals(chapterId)) {
            throw new EntityNotFoundException("Lesson not found in chapter: " + chapterId);
        }

        Chapter chapter = chapterRepository.findByIdAndDeletedFalse(chapterId)
                .orElseThrow(() -> new EntityNotFoundException("Chapter not found: " + chapterId));

        if (chapter.getCourse() == null || !chapter.getCourse().getId().equals(courseId)) {
            throw new EntityNotFoundException("Chapter not found in course: " + courseId);
        }

        enrollmentRepository.findByCourseIdAndStudentIdAndDeletedFalse(courseId, student.getId())
                .orElseThrow(() -> new SecurityException("You are not enrolled in this course"));

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

    private QuestionResponse toQuestionResponseForStudent(Question question) {
        QuestionResponse response = toQuestionResponse(question);
        response.getOptions().forEach(option -> option.setIsCorrect(null));
        return response;
    }

    private QuestionOptionResponse toOptionResponse(QuestionOption option) {
        QuestionOptionResponse response = new QuestionOptionResponse();
        response.setId(option.getId());
        response.setContent(option.getContent());
        response.setIsCorrect(option.getIsCorrect());
        return response;
    }

    private QuizAttemptResponse toQuizAttemptResponse(QuizAttempt attempt) {
        QuizAttemptResponse response = new QuizAttemptResponse();
        response.setId(attempt.getId());
        response.setQuizId(attempt.getQuiz() != null ? attempt.getQuiz().getId() : null);
        if (attempt.getQuiz() != null && attempt.getQuiz().getLesson() != null) {
            Lesson lesson = attempt.getQuiz().getLesson();
            response.setLessonId(lesson.getId());
            if (lesson.getChapter() != null && lesson.getChapter().getCourse() != null) {
                response.setCourseId(lesson.getChapter().getCourse().getId());
            }
        }
        response.setStudentId(attempt.getStudent() != null ? attempt.getStudent().getId() : null);
        response.setTotalScore(attempt.getTotalScore());
        response.setPassScore(attempt.getQuiz() != null ? attempt.getQuiz().getPassScore() : null);
        response.setPassed(attempt.getQuiz() != null && attempt.getTotalScore() >= attempt.getQuiz().getPassScore());
        response.setStartedAt(attempt.getStartedAt());
        response.setCompletedAt(attempt.getCompletedAt());
        return response;
    }
}
