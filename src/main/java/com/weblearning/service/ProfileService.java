package com.weblearning.service;

import com.weblearning.dto.profile.ProfileResponse;
import com.weblearning.dto.profile.UpdateProfileRequest;

public interface ProfileService {
    ProfileResponse getProfile(String username);

    ProfileResponse updateProfile(String username, UpdateProfileRequest request);
}
