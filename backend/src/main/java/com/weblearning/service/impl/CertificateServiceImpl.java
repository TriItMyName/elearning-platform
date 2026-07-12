package com.weblearning.service.impl;

import com.weblearning.dto.certificate.CertificateResponse;
import com.weblearning.entity.Certificate;
import com.weblearning.entity.Course;
import com.weblearning.entity.Enrollment;
import com.weblearning.entity.User;
import com.weblearning.repository.CertificateRepository;
import com.weblearning.repository.EnrollmentRepository;
import com.weblearning.service.CertificateService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CertificateServiceImpl implements CertificateService {

    private static final float REQUIRED_PROGRESS = 100F;

    private final CertificateRepository certificateRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CertificateServiceImpl(
            CertificateRepository certificateRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.certificateRepository = certificateRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Override
    public CertificateResponse generateForStudent(Long courseId, User student) {
        Enrollment enrollment = getEnrollment(courseId, student.getId());

        Certificate existingCertificate = certificateRepository
                .findByCourseIdAndStudentIdAndDeletedFalse(courseId, student.getId())
                .orElse(null);
        if (existingCertificate != null) {
            return toResponse(existingCertificate, enrollment.getProgress());
        }

        if (enrollment.getProgress() == null || enrollment.getProgress() < REQUIRED_PROGRESS) {
            throw new IllegalStateException("Student has not completed this course");
        }

        Certificate certificate = new Certificate();
        certificate.setCourse(enrollment.getCourse());
        certificate.setStudent(enrollment.getStudent());
        certificate.setCertificateCode(generateCertificateCode());
        certificate.setIssuedAt(LocalDateTime.now());
        certificate.setDeleted(false);

        return toResponse(certificateRepository.save(certificate), enrollment.getProgress());
    }

    @Override
    public CertificateResponse getByCourseForStudent(Long courseId, User student) {
        Enrollment enrollment = getEnrollment(courseId, student.getId());
        Certificate certificate = certificateRepository
                .findByCourseIdAndStudentIdAndDeletedFalse(courseId, student.getId())
                .orElseThrow(() -> new EntityNotFoundException("Certificate not found for course: " + courseId));
        return toResponse(certificate, enrollment.getProgress());
    }

    @Override
    public List<CertificateResponse> getAllForStudent(User student) {
        return certificateRepository.findByStudentIdAndDeletedFalseOrderByIssuedAtDesc(student.getId())
                .stream()
                .map(certificate -> toResponse(certificate, null))
                .toList();
    }

    @Override
    public CertificateResponse verify(String certificateCode) {
        Certificate certificate = certificateRepository.findByCertificateCodeAndDeletedFalse(certificateCode)
                .orElseThrow(() -> new EntityNotFoundException("Certificate not found: " + certificateCode));
        return toResponse(certificate, null);
    }

    private Enrollment getEnrollment(Long courseId, Long studentId) {
        return enrollmentRepository.findByCourseIdAndStudentIdAndDeletedFalse(courseId, studentId)
                .orElseThrow(() -> new EntityNotFoundException("Enrollment not found for course: " + courseId));
    }

    private String generateCertificateCode() {
        String code;
        do {
            code = "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (certificateRepository.existsByCertificateCode(code));
        return code;
    }

    private CertificateResponse toResponse(Certificate certificate, Float progress) {
        CertificateResponse response = new CertificateResponse();
        response.setId(certificate.getId());
        response.setCertificateCode(certificate.getCertificateCode());
        response.setIssuedAt(certificate.getIssuedAt());
        response.setProgress(progress);

        Course course = certificate.getCourse();
        if (course != null) {
            response.setCourseId(course.getId());
            response.setCourseTitle(course.getTitle());
            response.setCourseSlug(course.getSlug());
            if (course.getInstructor() != null) {
                response.setInstructorId(course.getInstructor().getId());
                response.setInstructorName(course.getInstructor().getFullName());
            }
        }

        if (certificate.getStudent() != null) {
            response.setStudentId(certificate.getStudent().getId());
            response.setStudentName(certificate.getStudent().getFullName());
        }

        return response;
    }
}
