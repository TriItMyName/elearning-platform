package com.weblearning.service.impl;

import com.weblearning.dto.course.CourseResponse;
import com.weblearning.entity.Course;
import com.weblearning.entity.User;
import com.weblearning.repository.CourseRepository;
import com.weblearning.service.CourseService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;

    private CourseResponse toCourseResponse(Course course) {
        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setInstructorId(course.getInstructor() != null ? course.getInstructor().getId() : null);
        response.setCategoryId(course.getCategory() != null ? course.getCategory().getId() : null);
        response.setTitle(course.getTitle());
        response.setSlug(course.getSlug());
        response.setStatus(course.getStatus());
        response.setCreatedAt(course.getCreatedAt());
        response.setDescription(course.getDescription());
        return response;
    }

    @Override
    public CourseResponse create(Course course) {
        return toCourseResponse(courseRepository.save(course));
    }

    @Override
    public Optional<CourseResponse> getById(Long id) {
        return courseRepository.findById(id)
                .map(this::toCourseResponse);
    }

    @Override
    public List<CourseResponse> getAll() {
        return courseRepository.findAll().stream()
                .map(this::toCourseResponse)
                .toList();
    }

    @Override
    public Page<CourseResponse> getAll(Pageable pageable) {
        return courseRepository.findAll(pageable)
                .map(this::toCourseResponse);
    }

    @Override
    public CourseResponse update(Long id, Course course) {
        Course existing = courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + id));
        existing.setTitle(course.getTitle());
        existing.setSlug(course.getSlug());
        existing.setDescription(course.getDescription());
        existing.setCategory(course.getCategory());
        existing.setInstructor(course.getInstructor());
        existing.setStatus(course.getStatus());
        existing.setCreatedAt(course.getCreatedAt());
        return toCourseResponse(courseRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new EntityNotFoundException("Course not found: " + id);
        }
        courseRepository.deleteById(id);
    }

    @Override
    public List<CourseResponse> getCoursesByInstructor(User instructor) {
        return courseRepository.findByInstructor(instructor).stream()
                .map(this::toCourseResponse)
                .toList();
    }

    @Override
    public Page<CourseResponse> getCoursesByInstructor(User instructor, Pageable pageable) {
        return courseRepository.findByInstructor(instructor, pageable)
                .map(this::toCourseResponse);
    }

    @Override
    public CourseResponse createForInstructor(Course course, User instructor) {
        course.setInstructor(instructor);
        return toCourseResponse(courseRepository.save(course));
    }

    @Override
    public CourseResponse updateForInstructor(Long id, Course course, User instructor) {
        Course existing = courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + id));
        if (existing.getInstructor() == null || !existing.getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("You are not the instructor of this course");
        }
        existing.setTitle(course.getTitle());
        existing.setSlug(course.getSlug());
        existing.setDescription(course.getDescription());
        existing.setCategory(course.getCategory());
        existing.setStatus(course.getStatus());
        existing.setCreatedAt(course.getCreatedAt());
        return toCourseResponse(courseRepository.save(existing));
    }

    @Override
    public void deleteForInstructor(Long id, User instructor) {
        Course existing = courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Course not found: " + id));

        if (existing.getInstructor() == null || !existing.getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("You do not have permission to delete this course");
        }
        courseRepository.delete(existing);
    }
}
