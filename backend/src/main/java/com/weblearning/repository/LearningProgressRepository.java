package com.weblearning.repository;

import com.weblearning.entity.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {
    List<LearningProgress> findByEnrollmentIdAndDeletedFalseOrderByLessonOrderIndexAsc(Long enrollmentId);

    long countByEnrollmentIdAndCompletedTrueAndDeletedFalse(Long enrollmentId);
}
