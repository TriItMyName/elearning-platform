package com.weblearning.service;

import java.util.Optional;

import com.weblearning.entity.RefreshToken;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(String username);

    RefreshToken verifyRefreshToken(String refreshToken);

    Optional<RefreshToken> findByToken(String refreshToken);

    void deleteByUserId(Long userId);
}
