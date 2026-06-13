package com.weblearning.service.impl;

import com.weblearning.dto.profile.ProfileResponse;
import com.weblearning.dto.profile.UpdateProfileRequest;
import com.weblearning.entity.User;
import com.weblearning.entity.enums.UserStatus;
import com.weblearning.exception.UserNotFoundException;
import com.weblearning.repository.AuthRepository;
import com.weblearning.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final AuthRepository authRepository;

    @Override
    public ProfileResponse getProfile(String username) {
        return toProfileResponse(getUserByUsername(username));
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = getUserByUsername(username);

        authRepository.findByEmail(request.getEmail())
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new RuntimeException("Email already exists");
                });

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setUpdatedAt(LocalDateTime.now());

        return toProfileResponse(authRepository.save(user));
    }

    private User getUserByUsername(String username) {
        return authRepository.findByUsername(username).orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private ProfileResponse toProfileResponse(User user) {
        ProfileResponse response = new ProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setActive(user.getStatus() == UserStatus.ACTIVE);
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}
