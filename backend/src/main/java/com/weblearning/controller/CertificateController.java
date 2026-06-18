package com.weblearning.controller;

import com.weblearning.dto.certificate.CertificateResponse;
import com.weblearning.entity.User;
import com.weblearning.service.AuthService;
import com.weblearning.service.CertificateService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;
    private final AuthService authService;

    @PostMapping("/student/courses/{courseId}/generate")
    public ResponseEntity<CertificateResponse> generateForStudent(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        try {
            User student = getCurrentUser(authentication);
            return ResponseEntity.ok(certificateService.generateForStudent(courseId, student));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/student/courses/{courseId}")
    public ResponseEntity<CertificateResponse> getByCourseForStudent(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        try {
            User student = getCurrentUser(authentication);
            return ResponseEntity.ok(certificateService.getByCourseForStudent(courseId, student));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/student")
    public ResponseEntity<List<CertificateResponse>> getAllForStudent(Authentication authentication) {
        User student = getCurrentUser(authentication);
        return ResponseEntity.ok(certificateService.getAllForStudent(student));
    }

    @GetMapping("/verify/{certificateCode}")
    public ResponseEntity<CertificateResponse> verify(@PathVariable String certificateCode) {
        try {
            return ResponseEntity.ok(certificateService.verify(certificateCode));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    private User getCurrentUser(Authentication authentication) {
        return authService.getUserByUserName(authentication.getName());
    }
}
