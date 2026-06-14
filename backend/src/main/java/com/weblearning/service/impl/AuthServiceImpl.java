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
import com.weblearning.entity.Permission;
import com.weblearning.entity.RefreshToken;
import com.weblearning.entity.User;
import com.weblearning.exception.AlreadyUserException;
import com.weblearning.exception.UserNotFoundException;
import com.weblearning.exception.AccountStatusException;
import com.weblearning.repository.AuthRepository;
import com.weblearning.service.AuthService;
import com.weblearning.dto.auth.CurrentUserResponse;
import com.weblearning.service.RefreshTokenService;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import com.weblearning.entity.Role;
import com.weblearning.entity.enums.UserStatus;
import com.weblearning.repository.admin.RoleRepository;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = authRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UserNotFoundException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UserNotFoundException("Invalid credentials");
        }
        if (user.getStatus() == UserStatus.LOCKED) {
            throw new AccountStatusException("Tài khoản của bạn đã bị khóa");
        }
        if (user.getStatus() == UserStatus.DISABLED) {
            throw new AccountStatusException("Tài khoản của bạn đã bị vô hiệu hóa");
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
            throw new AlreadyUserException("Username already exists");
        }

        String requestedRoleName = request.getRole() != null && !request.getRole().trim().isEmpty()
                ? request.getRole().trim().toUpperCase()
                : "STUDENT";

        Role role = roleRepository.findByName(requestedRoleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + requestedRoleName));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .status(UserStatus.ACTIVE)
                .roles(new HashSet<>(Set.of(role)))
                .build();
        return authRepository.save(user);
    }

    @Override
    public User getUserByUserName(String username) {
        return authRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
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

    @Override
    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(String username) {
        User user = authRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return CurrentUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(Role::getName).toList())
                .permissions(
                        user.getRoles()
                                .stream()
                                .flatMap(role -> role.getPermissions().stream())
                                .map(Permission::getName)
                                .distinct()
                                .toList())
                .build();
    }
}
