package com.weblearning.controller;

import com.weblearning.dto.teacher.TeacherProfileResponse;
import com.weblearning.dto.teacher.UpdateTeacherProfileRequest;
import com.weblearning.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teacher/profile")
@RequiredArgsConstructor
public class TeacherProfileController {

    private final AuthService authService;

    @GetMapping
    public ResponseEntity<TeacherProfileResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(authService.getTeacherProfile(authentication.getName()));
    }

    @PutMapping
    public ResponseEntity<TeacherProfileResponse> updateProfile(
            @Valid @RequestBody UpdateTeacherProfileRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(authService.updateTeacherProfile(authentication.getName(), request));
    }
}
