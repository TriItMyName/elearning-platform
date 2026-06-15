package com.weblearning.service.impl;

import com.weblearning.dto.enrollment.EnrollmentResponse;
import com.weblearning.entity.Course;
import com.weblearning.entity.Enrollment;
import com.weblearning.entity.User;
import com.weblearning.repository.CourseRepository;
import com.weblearning.repository.EnrollmentRepository;
import com.weblearning.service.EnrollmentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    @Override
    public List<EnrollmentResponse> getStudentsForInstructor(Long courseId, User instructor) {
        getOwnedCourse(courseId, instructor);

        return enrollmentRepository.findByCourseIdAndDeletedFalseOrderByEnrolledAtDesc(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public EnrollmentResponse enrollCourseForStudent(Long courseId, User student) {
        Course course = courseRepository.findByIdAndDeletedFalse(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + courseId));

        Enrollment enrollment = enrollmentRepository.findByCourseIdAndStudentId(courseId, student.getId())
                .map(existing -> restoreEnrollment(existing, course, student))
                .orElseGet(() -> createEnrollment(course, student));

        return toResponse(enrollmentRepository.save(enrollment));
    }

    @Override
    public List<EnrollmentResponse> getEnrollmentsForStudent(User student) {
        return enrollmentRepository.findByStudentIdAndDeletedFalseOrderByEnrolledAtDesc(student.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Enrollment createEnrollment(Course course, User student) {
        Enrollment enrollment = new Enrollment();
        enrollment.setCourse(course);
        enrollment.setStudent(student);
        enrollment.setEnrolledAt(LocalDateTime.now());
        enrollment.setProgress(0F);
        enrollment.setDeleted(false);
        return enrollment;
    }

    private Enrollment restoreEnrollment(Enrollment enrollment, Course course, User student) {
        if (!enrollment.isDeleted()) {
            return enrollment;
        }

        enrollment.setCourse(course);
        enrollment.setStudent(student);
        enrollment.setEnrolledAt(LocalDateTime.now());
        enrollment.setProgress(enrollment.getProgress() != null ? enrollment.getProgress() : 0F);
        enrollment.setDeleted(false);
        enrollment.setDeletedAt(null);
        return enrollment;
    }

    private Course getOwnedCourse(Long courseId, User instructor) {
        Course course = courseRepository.findByIdAndDeletedFalse(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + courseId));

        if (course.getInstructor() == null || !course.getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("You are not the instructor of this course");
        }

        return course;
    }

    private EnrollmentResponse toResponse(Enrollment enrollment) {
        EnrollmentResponse response = new EnrollmentResponse();
        response.setEnrollmentId(enrollment.getId());
        response.setCourseId(enrollment.getCourse() != null ? enrollment.getCourse().getId() : null);
        if (enrollment.getCourse() != null) {
            response.setCourseTitle(enrollment.getCourse().getTitle());
            response.setCourseSlug(enrollment.getCourse().getSlug());
        }
        response.setProgress(enrollment.getProgress());
        response.setEnrolledAt(enrollment.getEnrolledAt());

        if (enrollment.getStudent() != null) {
            response.setStudentId(enrollment.getStudent().getId());
            response.setUsername(enrollment.getStudent().getUsername());
            response.setFullName(enrollment.getStudent().getFullName());
            response.setEmail(enrollment.getStudent().getEmail());
        }

        return response;
    }
}
