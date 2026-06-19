package com.weblearning.service.impl.admin;

import com.weblearning.dto.admin.AdminStudentLearningResponse;
import com.weblearning.dto.admin.AdminStudentOverviewResponse;
import com.weblearning.dto.enrollment.EnrollmentResponse;
import com.weblearning.entity.Enrollment;
import com.weblearning.entity.User;
import com.weblearning.exception.UserNotFoundException;
import com.weblearning.repository.EnrollmentRepository;
import com.weblearning.repository.admin.UserRepository;
import com.weblearning.service.admin.AdminStudentService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminStudentServiceImpl implements AdminStudentService {

    private static final String STUDENT_ROLE = "STUDENT";

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Override
    public Page<AdminStudentOverviewResponse> listStudents(String keyword, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            query.distinct(true);
            Predicate predicate = cb.equal(cb.upper(root.join("roles").get("name")), STUDENT_ROLE);

            if (keyword != null && !keyword.trim().isEmpty()) {
                String search = "%" + keyword.trim().toLowerCase() + "%";
                Predicate usernameLike = cb.like(cb.lower(root.get("username")), search);
                Predicate fullNameLike = cb.like(cb.lower(root.get("fullName")), search);
                Predicate emailLike = cb.like(cb.lower(root.get("email")), search);
                predicate = cb.and(predicate, cb.or(usernameLike, fullNameLike, emailLike));
            }

            return predicate;
        };

        return userRepository.findAll(spec, pageable).map(this::toOverview);
    }

    @Override
    public AdminStudentLearningResponse getStudentLearning(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new UserNotFoundException("Student not found with id: " + studentId));

        List<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndDeletedFalseOrderByEnrolledAtDesc(studentId);
        List<EnrollmentResponse> enrollmentResponses = enrollments.stream()
                .map(this::toEnrollmentResponse)
                .toList();

        return AdminStudentLearningResponse.builder()
                .id(student.getId())
                .username(student.getUsername())
                .fullName(student.getFullName())
                .email(student.getEmail())
                .enrolledCourses(enrollments.size())
                .averageProgress(averageProgress(enrollments))
                .enrollments(enrollmentResponses)
                .build();
    }

    private AdminStudentOverviewResponse toOverview(User student) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndDeletedFalse(student.getId());

        return AdminStudentOverviewResponse.builder()
                .id(student.getId())
                .username(student.getUsername())
                .fullName(student.getFullName())
                .email(student.getEmail())
                .enrolledCourses(enrollments.size())
                .averageProgress(averageProgress(enrollments))
                .lastEnrolledAt(latestEnrolledAt(enrollments))
                .build();
    }

    private EnrollmentResponse toEnrollmentResponse(Enrollment enrollment) {
        EnrollmentResponse response = new EnrollmentResponse();
        response.setEnrollmentId(enrollment.getId());
        response.setCourseId(enrollment.getCourse() != null ? enrollment.getCourse().getId() : null);
        response.setCourseTitle(enrollment.getCourse() != null ? enrollment.getCourse().getTitle() : null);
        response.setCourseSlug(enrollment.getCourse() != null ? enrollment.getCourse().getSlug() : null);
        response.setStudentId(enrollment.getStudent() != null ? enrollment.getStudent().getId() : null);
        response.setUsername(enrollment.getStudent() != null ? enrollment.getStudent().getUsername() : null);
        response.setFullName(enrollment.getStudent() != null ? enrollment.getStudent().getFullName() : null);
        response.setEmail(enrollment.getStudent() != null ? enrollment.getStudent().getEmail() : null);
        response.setProgress(enrollment.getProgress());
        response.setEnrolledAt(enrollment.getEnrolledAt());
        return response;
    }

    private Float averageProgress(List<Enrollment> enrollments) {
        if (enrollments.isEmpty()) {
            return null;
        }
        return (float) enrollments.stream()
                .mapToDouble(enrollment -> enrollment.getProgress() != null ? enrollment.getProgress() : 0D)
                .average()
                .orElse(0D);
    }

    private LocalDateTime latestEnrolledAt(List<Enrollment> enrollments) {
        return enrollments.stream()
                .map(Enrollment::getEnrolledAt)
                .filter(date -> date != null)
                .max(Comparator.naturalOrder())
                .orElse(null);
    }
}
