package com.weblearning.repository;

import com.weblearning.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByLessonIdOrderByCreatedAtDesc(Long lessonId);
}
