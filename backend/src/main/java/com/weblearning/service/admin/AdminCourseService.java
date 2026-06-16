package com.weblearning.service.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.weblearning.dto.admin.AdminCourseDtoResponse;
import com.weblearning.dto.admin.AdminCourseRequest;
import com.weblearning.dto.admin.AdminCourseUpdateRequest;

public interface AdminCourseService {

    public Page<AdminCourseDtoResponse> getAllCourses(Pageable pageable);

    public AdminCourseDtoResponse getCourseById(Long id);

    public AdminCourseDtoResponse createCourse(AdminCourseRequest request);

    public AdminCourseDtoResponse updateCourse(Long id, AdminCourseUpdateRequest request);

    public void deleteCourse(Long id);

    public Page<AdminCourseDtoResponse> getDeletedCourses(Pageable pageable);

    public AdminCourseDtoResponse restoreCourse(Long id);
}
