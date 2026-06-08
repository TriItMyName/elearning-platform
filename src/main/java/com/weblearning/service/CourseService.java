package com.weblearning.service;

import com.weblearning.dto.course.CourseResponse;
import com.weblearning.entity.Course;
import com.weblearning.entity.User;

import java.util.List;
import java.util.Optional;

public interface CourseService {
    CourseResponse create(Course course);

    Optional<CourseResponse> getById(Long id);

    List<CourseResponse> getAll();

    CourseResponse update(Long id, Course course);

    void delete(Long id);

    List<CourseResponse> getCoursesByInstructor(User instructor);

    CourseResponse createForInstructor(Course course, User instructor);

    CourseResponse updateForInstructor(Long id, Course course, User instructor);

    void deleteForInstructor(Long id, User instructor);
}

