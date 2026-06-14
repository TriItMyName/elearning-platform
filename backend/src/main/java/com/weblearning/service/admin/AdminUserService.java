package com.weblearning.service.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.weblearning.dto.user.CreateUserRequest;
import com.weblearning.dto.user.UpdateUserRequest;
import com.weblearning.dto.user.UpdateUserStatusRequest;
import com.weblearning.dto.user.UserResponse;
import com.weblearning.entity.enums.UserStatus;

public interface AdminUserService {
    Page<UserResponse> getAllUsers(String keyword, UserStatus status, Pageable pageable);

    UserResponse getUserById(Long id);

    UserResponse createUser(CreateUserRequest request);

    UserResponse updateUser(Long id, UpdateUserRequest request);

    void deleteUser(Long id);

    UserResponse updateUserStatus(Long id, UpdateUserStatusRequest request);
}
