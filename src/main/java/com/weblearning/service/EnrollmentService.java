package com.weblearning.service;

import com.weblearning.dto.course.EnrollmentResponse;
import com.weblearning.entity.User;

import java.util.List;

public interface EnrollmentService {
    List<EnrollmentResponse> getStudentsForInstructor(Long courseId, User instructor);
}
