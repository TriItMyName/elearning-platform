package com.weblearning.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.weblearning.entity.User;

public interface AuthRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);
}
