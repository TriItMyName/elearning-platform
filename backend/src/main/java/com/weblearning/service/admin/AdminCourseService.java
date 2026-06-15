package com.weblearning.service.admin;

import java.util.List;

import com.weblearning.dto.admin.AdminCourseDtoResponse;
import com.weblearning.dto.admin.AdminCourseRequest;
import com.weblearning.dto.admin.AdminCourseUpdateRequest;

public interface AdminCourseService {

    public List<AdminCourseDtoResponse> getAllCourses();

    public AdminCourseDtoResponse getCourseById(Long id);

    public AdminCourseDtoResponse createCourse(AdminCourseRequest request);

    public AdminCourseDtoResponse updateCourse(Long id, AdminCourseUpdateRequest request);

    public void deleteCourse(Long id);

    public List<AdminCourseDtoResponse> getDeletedCourses();

    public AdminCourseDtoResponse restoreCourse(Long id);
}
