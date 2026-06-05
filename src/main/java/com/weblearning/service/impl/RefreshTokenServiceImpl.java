package com.weblearning.service.impl;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.weblearning.entity.RefreshToken;
import com.weblearning.entity.User;
import com.weblearning.repository.AuthRepository;
import com.weblearning.repository.RefreshTokenRepository;
import com.weblearning.service.RefreshTokenService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    @Value("${jwt.refresh-expiration}")
    private Long refreshExpiration;

    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthRepository authRepository;

    @Override
    @Transactional
    public RefreshToken createRefreshToken(String username) {
        User user = authRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        
        // Xóa refresh token cũ của user nếu có để tránh dư thừa dữ liệu
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .expiryDate(Instant.now().plusMillis(refreshExpiration))
                .refreshToken(UUID.randomUUID().toString())
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    @Transactional
    public void deleteByUserId(Long userId) {
        User user = authRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        refreshTokenRepository.deleteByUser(user);
    }

    @Override
    public Optional<RefreshToken> findByToken(String refreshToken) {
        return refreshTokenRepository.findByRefreshToken(refreshToken);
    }

    @Override
    @Transactional
    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByRefreshToken(token)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        if (refreshToken.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }

        return refreshToken;
    }

}
