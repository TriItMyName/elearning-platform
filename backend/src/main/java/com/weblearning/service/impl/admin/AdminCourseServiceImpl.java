package com.weblearning.service.impl.admin;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.weblearning.dto.admin.AdminCourseDtoResponse;
import com.weblearning.dto.admin.AdminCourseRequest;
import com.weblearning.dto.admin.AdminCourseUpdateRequest;
import com.weblearning.entity.Category;
import com.weblearning.entity.Course;
import com.weblearning.entity.User;
import com.weblearning.entity.enums.CourseStatus;
import com.weblearning.exception.AlreadyUserException;
import com.weblearning.exception.ResourceNotFoundException;
import com.weblearning.repository.admin.AdminCategoryRepository;
import com.weblearning.repository.admin.AdminCourseRepository;
import com.weblearning.repository.admin.UserRepository;
import com.weblearning.service.admin.AdminCourseService;
import com.weblearning.utils.StringUnitls;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminCourseServiceImpl implements AdminCourseService {

    private final AdminCourseRepository adminCourseRepository;
    private final AdminCategoryRepository adminCategoryRepository;
    private final UserRepository userRepository;

    // Cache variables
    private List<AdminCourseDtoResponse> cachedCourses = null;
    private long cacheExpiryTime = 0L;
    private final Object cacheLock = new Object();

    // Mapping helper from Course entity to DTO Response
    private AdminCourseDtoResponse mapToCourseDtoResponse(Course course) {
        return new AdminCourseDtoResponse(
                course.getId(),
                course.getCategory() != null ? course.getCategory().getId() : null,
                course.getInstructor() != null ? course.getInstructor().getId() : null,
                course.getTitle(),
                course.getSlug(),
                course.getDescription(),
                course.getAdminStatus(),
                course.getCreatedAt(),
                course.getUpdatedAt()
        );
    }

    // Helper to clear cache after mutations
    private void clearCache() {
        synchronized (cacheLock) {
            cachedCourses = null;
            cacheExpiryTime = 0L;
        }
    }

    @Override
    @Transactional
    public AdminCourseDtoResponse createCourse(AdminCourseRequest request) {
        if (adminCourseRepository.existsByTitle(request.getTitle())) {
            throw new AlreadyUserException("Course title already exists");
        }
        String slug = StringUnitls.toSlug(request.getTitle());
        if (adminCourseRepository.existsBySlug(slug)) {
            throw new AlreadyUserException("Course slug already exists");
        }

        Category category = adminCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        User instructor = userRepository.findById(request.getInstructorId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + request.getInstructorId()));

        Course course = Course.builder()
                .category(category)
                .instructor(instructor)
                .title(request.getTitle())
                .slug(slug)
                .description(request.getDescription())
                .status(0)
                .adminStatus(request.getAdminStatus() != null ? request.getAdminStatus() : CourseStatus.DRAFT)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build();

        Course savedCourse = adminCourseRepository.save(course);
        clearCache();
        return mapToCourseDtoResponse(savedCourse);
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        Course course = adminCourseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        course.setDeleted(true);
        course.setDeletedAt(LocalDateTime.now());
        adminCourseRepository.save(course);
        clearCache();
    }

    @Override
    public List<AdminCourseDtoResponse> getAllCourses() {
        long now = System.currentTimeMillis();
        synchronized (cacheLock) {
            if (cachedCourses == null || now > cacheExpiryTime) {
                cachedCourses = adminCourseRepository.findByDeletedFalse().stream()
                        .map(this::mapToCourseDtoResponse)
                        .toList();
                cacheExpiryTime = now + (5 * 60 * 1000); // 5 minutes cache TTL
            }
            return cachedCourses;
        }
    }

    @Override
    public AdminCourseDtoResponse getCourseById(Long id) {
        Course course = adminCourseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return mapToCourseDtoResponse(course);
    }

    @Override
    @Transactional
    public AdminCourseDtoResponse updateCourse(Long id, AdminCourseUpdateRequest request) {
        Course course = adminCourseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            String newTitle = request.getTitle().trim();
            if (!course.getTitle().equals(newTitle)) {
                if (adminCourseRepository.existsByTitle(newTitle)) {
                    throw new AlreadyUserException("Course title already exists");
                }
                String slug = StringUnitls.toSlug(newTitle);
                if (adminCourseRepository.existsBySlug(slug)) {
                    throw new AlreadyUserException("Course slug already exists");
                }
                course.setTitle(newTitle);
                course.setSlug(slug);
            }
        }

        if (request.getCategoryId() != null) {
            Category category = adminCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            course.setCategory(category);
        }

        if (request.getInstructorId() != null) {
            User instructor = userRepository.findById(request.getInstructorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + request.getInstructorId()));
            course.setInstructor(instructor);
        }

        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }

        if (request.getAdminStatus() != null) {
            course.setAdminStatus(request.getAdminStatus());
        }

        course.setUpdatedAt(LocalDateTime.now());
        Course updatedCourse = adminCourseRepository.save(course);
        clearCache();
        return mapToCourseDtoResponse(updatedCourse);
    }

    @Override
    public List<AdminCourseDtoResponse> getDeletedCourses() {
        return adminCourseRepository.findByDeletedTrue().stream()
                .map(this::mapToCourseDtoResponse)
                .toList();
    }

    @Override
    @Transactional
    public AdminCourseDtoResponse restoreCourse(Long id) {
        Course course = adminCourseRepository.findByIdAndDeletedTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deleted course not found with id: " + id));

        if (adminCourseRepository.existsByTitle(course.getTitle())) {
            throw new AlreadyUserException("Cannot restore: Course title already exists in active courses");
        }
        if (adminCourseRepository.existsBySlug(course.getSlug())) {
            throw new AlreadyUserException("Cannot restore: Course slug already exists in active courses");
        }

        course.setDeleted(false);
        course.setDeletedAt(null);
        course.setUpdatedAt(LocalDateTime.now());
        Course restoredCourse = adminCourseRepository.save(course);
        clearCache();
        return mapToCourseDtoResponse(restoredCourse);
    }

}
