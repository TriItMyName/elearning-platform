package com.weblearning.repository;

import com.weblearning.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByCourseIdAndDeletedFalseOrderByEnrolledAtDesc(Long courseId);

    List<Enrollment> findByStudentIdAndDeletedFalse(Long studentId);

    List<Enrollment> findByStudentIdAndDeletedFalseOrderByEnrolledAtDesc(Long studentId);

    Optional<Enrollment> findByCourseIdAndStudentIdAndDeletedFalse(Long courseId, Long studentId);

    long countByCourseIdAndDeletedFalse(Long courseId);
}
