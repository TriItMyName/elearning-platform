package com.weblearning.repository;

import com.weblearning.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizIdAndDeletedFalseOrderByStartedAtDesc(Long quizId);

    List<QuizAttempt> findByStudentIdAndDeletedFalseOrderByStartedAtDesc(Long studentId);

    List<QuizAttempt> findByQuizIdAndStudentIdAndDeletedFalseOrderByStartedAtDesc(Long quizId, Long studentId);
}
