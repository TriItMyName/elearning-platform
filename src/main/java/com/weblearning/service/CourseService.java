package com.weblearning.service;

import com.weblearning.entity.Course;

import java.util.List;
import java.util.Optional;

public interface CourseService {
    Course create(Course course);

    Optional<Course> getById(Long id);

    List<Course> getAll();

    Course update(Long id, Course course);

    void delete(Long id);
}

