package com.weblearning.service.admin;

import com.weblearning.dto.admin.AdminStudentLearningResponse;
import com.weblearning.dto.admin.AdminStudentOverviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminStudentService {
    Page<AdminStudentOverviewResponse> listStudents(String keyword, Pageable pageable);

    AdminStudentLearningResponse getStudentLearning(Long studentId);
}
