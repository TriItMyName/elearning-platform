package com.weblearning.service.impl.admin;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
                resolveInstructorName(course.getInstructor()),
                course.getTitle(),
                course.getSlug(),
                course.getDescription(),
                course.getThumbnail(),
                course.getAdminStatus(),
                course.getCreatedAt(),
                course.getUpdatedAt());
    }

    private String resolveInstructorName(User instructor) {
        if (instructor == null) {
            return null;
        }
        if (instructor.getFullName() != null && !instructor.getFullName().isBlank()) {
            return instructor.getFullName();
        }
        return instructor.getUsername();
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
                .orElseThrow(
                        () -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        User instructor = userRepository.findById(request.getInstructorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Instructor not found with id: " + request.getInstructorId()));

        Course course = Course.builder()
                .category(category)
                .instructor(instructor)
                .title(request.getTitle())
                .slug(slug)
                .description(request.getDescription())
                .thumbnail(request.getThumbnail())
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

    private List<AdminCourseDtoResponse> getAllCoursesRaw() {
        // NOTE: Disable in-memory cache for admin courses list.
        // Always read from DB so soft-delete/restore reflects immediately.
        return adminCourseRepository.findByDeletedFalse().stream()
                .map(this::mapToCourseDtoResponse)
                .toList();

        // ---- Previous cache implementation (kept for reference; do not delete) ----
        // long now = System.currentTimeMillis();
        // synchronized (cacheLock) {
        //     if (cachedCourses == null || now > cacheExpiryTime) {
        //         cachedCourses = adminCourseRepository.findByDeletedFalse().stream()
        //                 .map(this::mapToCourseDtoResponse)
        //                 .toList();
        //         cacheExpiryTime = now + (5 * 60 * 1000); // 5 minutes cache TTL
        //     }
        //     return cachedCourses;
        // }
    }

    @Override
    public Page<AdminCourseDtoResponse> getAllCourses(Pageable pageable) {
        List<AdminCourseDtoResponse> list = getAllCoursesRaw().stream()
                .filter(course -> course.getAdminStatus() != CourseStatus.PENDING
                        && course.getAdminStatus() != CourseStatus.REJECTED)
                .collect(Collectors.toCollection(ArrayList::new));

        if (pageable.getSort().isSorted()) {
            Sort.Order order = pageable.getSort().iterator().next();
            String property = order.getProperty();
            boolean isAsc = order.isAscending();

            Comparator<AdminCourseDtoResponse> comparator = switch (property) {
                case "title" -> Comparator.comparing(AdminCourseDtoResponse::getTitle,
                        Comparator.nullsLast(String::compareToIgnoreCase));
                case "createdAt" -> Comparator.comparing(AdminCourseDtoResponse::getCreatedAt,
                        Comparator.nullsLast(LocalDateTime::compareTo));
                case "updatedAt" -> Comparator.comparing(AdminCourseDtoResponse::getUpdatedAt,
                        Comparator.nullsLast(LocalDateTime::compareTo));
                default -> Comparator.comparing(AdminCourseDtoResponse::getId);
            };

            if (!isAsc) {
                comparator = comparator.reversed();
            }
            list.sort(comparator);
        } else {
            list.sort(Comparator.comparing(AdminCourseDtoResponse::getId));
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());

        if (start > list.size()) {
            return new PageImpl<>(Collections.emptyList(), pageable, list.size());
        }

        return new PageImpl<>(list.subList(start, end), pageable, list.size());
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
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: " + request.getCategoryId()));
            course.setCategory(category);
        }

        if (request.getInstructorId() != null) {
            User instructor = userRepository.findById(request.getInstructorId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Instructor not found with id: " + request.getInstructorId()));
            course.setInstructor(instructor);
        }

        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }

        if (request.getThumbnail() != null) {
            course.setThumbnail(request.getThumbnail());
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
    public Page<AdminCourseDtoResponse> getDeletedCourses(Pageable pageable) {
        return adminCourseRepository.findByDeletedTrue(pageable)
                .map(this::mapToCourseDtoResponse);
    }

    @Override
    @Transactional
    public AdminCourseDtoResponse restoreCourse(Long id) {
        Course course = adminCourseRepository.findByIdAndDeletedTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deleted course not found with id: " + id));

        if (adminCourseRepository.existsByTitleAndDeletedFalse(course.getTitle())) {
            throw new AlreadyUserException("Cannot restore: Course title already exists in active courses");
        }
        if (adminCourseRepository.existsBySlugAndDeletedFalse(course.getSlug())) {
            throw new AlreadyUserException("Cannot restore: Course slug already exists in active courses");
        }

        course.setDeleted(false);
        course.setDeletedAt(null);
        course.setUpdatedAt(LocalDateTime.now());
        Course restoredCourse = adminCourseRepository.save(course);
        clearCache();
        return mapToCourseDtoResponse(restoredCourse);
    }

    @Override
    public Page<AdminCourseDtoResponse> getPendingCourses(Pageable pageable) {
        List<AdminCourseDtoResponse> list = getAllCoursesRaw().stream()
                .filter(course -> CourseStatus.PENDING.equals(course.getAdminStatus()))
                .collect(Collectors.toList());

        return paginateList(list, pageable);
    }

    @Override
    public Page<AdminCourseDtoResponse> getRejectedCourses(Pageable pageable) {
        List<AdminCourseDtoResponse> list = getAllCoursesRaw().stream()
                .filter(course -> CourseStatus.REJECTED.equals(course.getAdminStatus()))
                .collect(Collectors.toList());

        return paginateList(list, pageable);
    }

    private Page<AdminCourseDtoResponse> paginateList(List<AdminCourseDtoResponse> list, Pageable pageable) {
        if (pageable.getSort().isSorted()) {
            Sort.Order order = pageable.getSort().iterator().next();
            String property = order.getProperty();
            boolean isAsc = order.isAscending();

            Comparator<AdminCourseDtoResponse> comparator = switch (property) {
                case "title" -> Comparator.comparing(AdminCourseDtoResponse::getTitle, Comparator.nullsLast(String::compareToIgnoreCase));
                case "createdAt" -> Comparator.comparing(AdminCourseDtoResponse::getCreatedAt, Comparator.nullsLast(LocalDateTime::compareTo));
                case "updatedAt" -> Comparator.comparing(AdminCourseDtoResponse::getUpdatedAt, Comparator.nullsLast(LocalDateTime::compareTo));
                default -> Comparator.comparing(AdminCourseDtoResponse::getId);
            };

            if (!isAsc) {
                comparator = comparator.reversed();
            }
            list.sort(comparator);
        } else {
            list.sort(Comparator.comparing(AdminCourseDtoResponse::getId));
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());

        if (start > list.size()) {
            return new PageImpl<>(Collections.emptyList(), pageable, list.size());
        }

        return new PageImpl<>(list.subList(start, end), pageable, list.size());
    }

    @Override
    @Transactional
    public AdminCourseDtoResponse approveCourse(Long id) {
        Course course = adminCourseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        if (course.getAdminStatus() != CourseStatus.PENDING && course.getAdminStatus() != CourseStatus.REJECTED) {
            throw new IllegalStateException("Cannot approve: Course is not in PENDING or REJECTED status. Current status: " + course.getAdminStatus());
        }

        course.setAdminStatus(CourseStatus.PUBLISHED);
        course.setStatus(1);
        course.setUpdatedAt(LocalDateTime.now());
        Course approvedCourse = adminCourseRepository.save(course);
        clearCache();
        return mapToCourseDtoResponse(approvedCourse);
    }

    @Override
    @Transactional
    public AdminCourseDtoResponse rejectCourse(Long id) {
        Course course = adminCourseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        if (course.getAdminStatus() != CourseStatus.PENDING) {
            throw new IllegalStateException("Cannot reject: Course is not in PENDING status. Current status: " + course.getAdminStatus());
        }

        course.setAdminStatus(CourseStatus.REJECTED);
        course.setUpdatedAt(LocalDateTime.now());
        Course rejectedCourse = adminCourseRepository.save(course);
        clearCache();
        return mapToCourseDtoResponse(rejectedCourse);
    }

}
