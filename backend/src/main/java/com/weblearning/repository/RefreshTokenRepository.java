package com.weblearning.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.weblearning.entity.RefreshToken;
import com.weblearning.entity.User;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByRefreshToken(String refreshToken);

    void deleteByUser(User user);
}
