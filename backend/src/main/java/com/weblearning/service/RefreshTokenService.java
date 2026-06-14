package com.weblearning.service;

import java.util.Optional;

import com.weblearning.entity.RefreshToken;
import com.weblearning.entity.User;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(User user);

    RefreshToken verifyRefreshToken(String refreshToken);

    Optional<RefreshToken> findByToken(String refreshToken);

    void deleteByUserId(Long userId);

    void deleteByToken(String token);
}
