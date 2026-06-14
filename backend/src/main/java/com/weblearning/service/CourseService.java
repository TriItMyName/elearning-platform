package com.weblearning.service;

import com.weblearning.dto.course.CourseResponse;
import com.weblearning.entity.Course;
import com.weblearning.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface CourseService {
    CourseResponse create(Course course);

    Optional<CourseResponse> getById(Long id);

    List<CourseResponse> getAll();

    Page<CourseResponse> getAll(Pageable pageable);

    CourseResponse update(Long id, Course course);

    void delete(Long id);

    List<CourseResponse> getCoursesByInstructor(User instructor);

    Page<CourseResponse> getCoursesByInstructor(User instructor, Pageable pageable);

    CourseResponse createForInstructor(Course course, User instructor);

    CourseResponse updateForInstructor(Long id, Course course, User instructor);

    void deleteForInstructor(Long id, User instructor);
}

