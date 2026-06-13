package com.weblearning.repository;

import com.weblearning.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuizIdAndDeletedFalseOrderByOrderIndexAsc(Long quizId);

    Optional<Question> findByIdAndDeletedFalse(Long id);
}
