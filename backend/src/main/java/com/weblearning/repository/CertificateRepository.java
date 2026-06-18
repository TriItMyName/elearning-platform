package com.weblearning.repository;

import com.weblearning.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByCourseIdAndStudentIdAndDeletedFalse(Long courseId, Long studentId);

    List<Certificate> findByStudentIdAndDeletedFalseOrderByIssuedAtDesc(Long studentId);

    Optional<Certificate> findByCertificateCodeAndDeletedFalse(String certificateCode);

    boolean existsByCertificateCode(String certificateCode);
}
