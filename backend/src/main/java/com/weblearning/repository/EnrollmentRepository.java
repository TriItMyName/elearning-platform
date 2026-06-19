package com.weblearning.repository;

import com.weblearning.entity.Enrollment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByCourseIdAndDeletedFalseOrderByEnrolledAtDesc(Long courseId);

    List<Enrollment> findByStudentIdAndDeletedFalse(Long studentId);

    List<Enrollment> findByStudentIdAndDeletedFalseOrderByEnrolledAtDesc(Long studentId);

    Optional<Enrollment> findByCourseIdAndStudentIdAndDeletedFalse(Long courseId, Long studentId);

    long countByCourseIdAndDeletedFalse(Long courseId);

    long countByDeletedFalse();

    long countByDeletedFalseAndProgressLessThan(Float progress);

    List<Enrollment> findByDeletedFalse();

    List<Enrollment> findByDeletedFalseAndCourse_DeletedFalse();

    List<Enrollment> findByDeletedFalseAndEnrolledAtGreaterThanEqual(LocalDateTime since);

    @EntityGraph(attributePaths = { "course", "student" })
    List<Enrollment> findByDeletedFalseOrderByEnrolledAtDesc(Pageable pageable);
}
