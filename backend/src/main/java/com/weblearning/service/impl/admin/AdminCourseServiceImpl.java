package com.weblearning.service.impl.admin;

import java.util.List;

import org.springframework.stereotype.Service;

import com.weblearning.dto.admin.AdminCourseDtoResponse;
import com.weblearning.dto.course.CourseResponse;
import com.weblearning.dto.course.CreateCourseRequest;
import com.weblearning.dto.course.UpdateCourseRequest;
import com.weblearning.service.admin.AdminCourseService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminCourseServiceImpl implements AdminCourseService {
    @Override
    public AdminCourseDtoResponse createCourse(CreateCourseRequest request) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void deleteCourse(Long id) {
        // TODO Auto-generated method stub

    }

    @Override
    public List<AdminCourseDtoResponse> getAllCourses() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public AdminCourseDtoResponse getCourseById(Long id) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public CourseResponse updateCourse(Long id, UpdateCourseRequest request) {
        // TODO Auto-generated method stub
        return null;
    }

}
