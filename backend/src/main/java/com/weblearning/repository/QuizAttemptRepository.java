package com.weblearning.repository;

import com.weblearning.entity.QuizAttempt;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizIdAndDeletedFalseOrderByStartedAtDesc(Long quizId);

    @EntityGraph(attributePaths = { "quiz", "quiz.lesson", "quiz.lesson.chapter", "quiz.lesson.chapter.course" })
    List<QuizAttempt> findByStudentIdAndDeletedFalseOrderByStartedAtDesc(Long studentId);

    List<QuizAttempt> findByQuizIdAndStudentIdAndDeletedFalseOrderByStartedAtDesc(Long quizId, Long studentId);

    long countByDeletedFalse();

    @EntityGraph(attributePaths = { "student", "quiz", "quiz.lesson" })
    List<QuizAttempt> findByDeletedFalseAndCompletedAtIsNotNullOrderByCompletedAtDesc(Pageable pageable);
}
