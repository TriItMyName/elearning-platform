package com.weblearning.service.impl;

import com.weblearning.dto.certificate.CertificateResponse;
import com.weblearning.entity.Certificate;
import com.weblearning.entity.Course;
import com.weblearning.entity.Enrollment;
import com.weblearning.entity.User;
import com.weblearning.repository.CertificateRepository;
import com.weblearning.repository.EnrollmentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CertificateServiceImplTest {

    @Mock
    private CertificateRepository certificateRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @InjectMocks
    private CertificateServiceImpl certificateService;

    @Test
    void generateForStudentCreatesCertificateWhenProgressIsComplete() {
        User student = student();
        Enrollment enrollment = enrollment(100F, student);

        when(enrollmentRepository.findByCourseIdAndStudentIdAndDeletedFalse(10L, 5L))
                .thenReturn(Optional.of(enrollment));
        when(certificateRepository.findByCourseIdAndStudentIdAndDeletedFalse(10L, 5L))
                .thenReturn(Optional.empty());
        when(certificateRepository.existsByCertificateCode(any())).thenReturn(false);
        when(certificateRepository.save(any(Certificate.class))).thenAnswer(invocation -> {
            Certificate certificate = invocation.getArgument(0);
            certificate.setId(1L);
            return certificate;
        });

        CertificateResponse response = certificateService.generateForStudent(10L, student);

        assertEquals(1L, response.getId());
        assertEquals(10L, response.getCourseId());
        assertEquals(5L, response.getStudentId());
        assertEquals(100F, response.getProgress());
        assertNotNull(response.getCertificateCode());

        ArgumentCaptor<Certificate> captor = ArgumentCaptor.forClass(Certificate.class);
        verify(certificateRepository).save(captor.capture());
        assertFalse(captor.getValue().isDeleted());
        assertNotNull(captor.getValue().getIssuedAt());
    }

    @Test
    void generateForStudentReturnsExistingCertificateWithoutCreatingDuplicate() {
        User student = student();
        Enrollment enrollment = enrollment(100F, student);
        Certificate certificate = certificate(enrollment);

        when(enrollmentRepository.findByCourseIdAndStudentIdAndDeletedFalse(10L, 5L))
                .thenReturn(Optional.of(enrollment));
        when(certificateRepository.findByCourseIdAndStudentIdAndDeletedFalse(10L, 5L))
                .thenReturn(Optional.of(certificate));

        CertificateResponse response = certificateService.generateForStudent(10L, student);

        assertEquals("CERT-EXISTING", response.getCertificateCode());
        assertEquals(100F, response.getProgress());
        verify(certificateRepository, never()).save(any(Certificate.class));
    }

    @Test
    void generateForStudentThrowsWhenProgressIsNotComplete() {
        User student = student();
        Enrollment enrollment = enrollment(75F, student);

        when(enrollmentRepository.findByCourseIdAndStudentIdAndDeletedFalse(10L, 5L))
                .thenReturn(Optional.of(enrollment));
        when(certificateRepository.findByCourseIdAndStudentIdAndDeletedFalse(10L, 5L))
                .thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class, () -> certificateService.generateForStudent(10L, student));
        verify(certificateRepository, never()).save(any(Certificate.class));
    }

    @Test
    void generateForStudentThrowsWhenEnrollmentDoesNotExist() {
        User student = student();
        when(enrollmentRepository.findByCourseIdAndStudentIdAndDeletedFalse(10L, 5L))
                .thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> certificateService.generateForStudent(10L, student));
    }

    private Enrollment enrollment(Float progress, User student) {
        User instructor = new User();
        instructor.setId(7L);
        instructor.setFullName("Teacher A");

        Course course = new Course();
        course.setId(10L);
        course.setTitle("Java Basic");
        course.setInstructor(instructor);

        Enrollment enrollment = new Enrollment();
        enrollment.setId(3L);
        enrollment.setCourse(course);
        enrollment.setStudent(student);
        enrollment.setProgress(progress);
        return enrollment;
    }

    private Certificate certificate(Enrollment enrollment) {
        Certificate certificate = new Certificate();
        certificate.setId(2L);
        certificate.setCourse(enrollment.getCourse());
        certificate.setStudent(enrollment.getStudent());
        certificate.setCertificateCode("CERT-EXISTING");
        certificate.setIssuedAt(LocalDateTime.of(2026, 6, 18, 10, 0));
        return certificate;
    }

    private User student() {
        User student = new User();
        student.setId(5L);
        student.setFullName("Student A");
        return student;
    }
}
