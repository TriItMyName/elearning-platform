package com.weblearning.controller.admin;

import com.weblearning.dto.admin.AdminStudentLearningResponse;
import com.weblearning.dto.admin.AdminStudentOverviewResponse;
import com.weblearning.service.admin.AdminStudentService;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('USER_MANAGE')")
public class AdminStudentController {

    private final AdminStudentService adminStudentService;

    @GetMapping
    public ResponseEntity<Page<AdminStudentOverviewResponse>> listStudents(
            @RequestParam(required = false) String keyword,
            @ParameterObject @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(adminStudentService.listStudents(keyword, pageable));
    }

    @GetMapping("/{id}/learning")
    public ResponseEntity<AdminStudentLearningResponse> getStudentLearning(@PathVariable Long id) {
        return ResponseEntity.ok(adminStudentService.getStudentLearning(id));
    }
}
