package com.weblearning.repository;

import com.weblearning.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByCourseIdAndDeletedFalseOrderByEnrolledAtDesc(Long courseId);

    long countByCourseIdAndDeletedFalse(Long courseId);
}
