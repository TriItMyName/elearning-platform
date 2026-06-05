package com.weblearning.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.weblearning.service.RefreshTokenService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/refresh-token")
@RequiredArgsConstructor
public class RefreshTokenController {
    private final RefreshTokenService refreshTokenService;

    @PostMapping
    public ResponseEntity<RefreshToken> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(refreshTokenService.verifyRefreshToken(request.getRefreshToken()));
    }

}
