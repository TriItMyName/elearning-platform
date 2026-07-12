package com.weblearning.service;

import com.weblearning.dto.auth.CurrentUserResponse;
import com.weblearning.dto.auth.LoginRequest;
import com.weblearning.dto.auth.LoginResponse;
import com.weblearning.dto.auth.RefreshTokenRequest;
import com.weblearning.dto.auth.RefreshTokenResponse;
import com.weblearning.dto.auth.RegisterRequest;
import com.weblearning.entity.User;

public interface AuthService {
    User register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    RefreshTokenResponse refreshToken(RefreshTokenRequest request);

    User getUserByUserName(String username);

    void logout(RefreshTokenRequest request);

    CurrentUserResponse getCurrentUser(String username);

}
