package com.weblearning.repository;

import com.weblearning.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByLessonIdAndDeletedFalseOrderByCreatedAtDesc(Long lessonId);

    Optional<Quiz> findByIdAndDeletedFalse(Long id);
}
