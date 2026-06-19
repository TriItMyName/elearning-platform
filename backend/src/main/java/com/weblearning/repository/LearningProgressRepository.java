package com.weblearning.repository;

import com.weblearning.entity.LearningProgress;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {
    List<LearningProgress> findByEnrollmentIdAndDeletedFalseOrderByLessonOrderIndexAsc(Long enrollmentId);

    Optional<LearningProgress> findByEnrollmentIdAndLessonIdAndDeletedFalse(Long enrollmentId, Long lessonId);

    long countByEnrollmentIdAndCompletedTrueAndDeletedFalse(Long enrollmentId);

    @EntityGraph(attributePaths = { "lesson", "enrollment", "enrollment.student" })
    List<LearningProgress> findByCompletedTrueAndDeletedFalseAndCompletedAtIsNotNullOrderByCompletedAtDesc(
            Pageable pageable);
}
