package com.weblearning.repository;

import com.weblearning.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByLessonIdOrderByCreatedAtDesc(Long lessonId);

    List<Assignment> findByLessonIdAndDeletedFalseOrderByCreatedAtDesc(Long lessonId);

    Optional<Assignment> findByIdAndDeletedFalse(Long id);
}
