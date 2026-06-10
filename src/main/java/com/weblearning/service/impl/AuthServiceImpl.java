package com.weblearning.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.weblearning.configs.JwtUtils;
import com.weblearning.dto.auth.LoginRequest;
import com.weblearning.dto.auth.LoginResponse;
import com.weblearning.dto.auth.RefreshTokenRequest;
import com.weblearning.dto.auth.RefreshTokenResponse;
import com.weblearning.dto.auth.RegisterRequest;
import com.weblearning.entity.RefreshToken;
import com.weblearning.entity.User;
import com.weblearning.exception.AlreadyUserException;
import com.weblearning.exception.UserNotFoundException;
import com.weblearning.repository.AuthRepository;
import com.weblearning.service.AuthService;
import com.weblearning.service.RefreshTokenService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = authRepository.findByUsername(request.getUsername())
                .orElseThrow(UserNotFoundException::new);
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UserNotFoundException();
        }
        String accessToken = jwtUtils.generateAccessToken(user.getUsername());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getRefreshToken())
                .expiresIn(jwtUtils.getExpiration())
                .tokenType("Bearer")
                .build();
    }

    @Override
    @Transactional
    public User register(RegisterRequest request) {
        if (authRepository.existsByUsername(request.getUsername())) {
            throw new AlreadyUserException();
        }
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .isActive(true)
                .build();
        return authRepository.save(user);
    }

    @Override
    public User getUserByUserName(String username) {
        return authRepository.findByUsername(username).orElseThrow(UserNotFoundException::new);
    }

    @Override
    @Transactional
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        RefreshToken token = refreshTokenService.verifyRefreshToken(requestRefreshToken);
        User user = token.getUser();
        
        String newAccessToken = jwtUtils.generateAccessToken(user.getUsername());
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);
        
        return RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken.getRefreshToken())
                .build();
    }

    @Override
    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenService.deleteByToken(request.getRefreshToken());
    }
}
