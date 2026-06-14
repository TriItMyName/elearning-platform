package com.weblearning.service.admin;

import java.util.List;

import com.weblearning.dto.admin.AdminCourseDtoResponse;
import com.weblearning.dto.course.CourseResponse;
import com.weblearning.dto.course.CreateCourseRequest;
import com.weblearning.dto.course.UpdateCourseRequest;

public interface AdminCourseService {

    public List<AdminCourseDtoResponse> getAllCourses();

    public AdminCourseDtoResponse getCourseById(Long id);

    public AdminCourseDtoResponse createCourse(CreateCourseRequest request);

    public CourseResponse updateCourse(Long id, UpdateCourseRequest request);

    public void deleteCourse(Long id);
}
