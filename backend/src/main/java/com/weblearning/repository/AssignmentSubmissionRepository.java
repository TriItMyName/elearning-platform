package com.weblearning.repository;

import com.weblearning.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    List<AssignmentSubmission> findByAssignmentIdAndDeletedFalseOrderBySubmittedAtDesc(Long assignmentId);

    Optional<AssignmentSubmission> findByIdAndDeletedFalse(Long id);
}
