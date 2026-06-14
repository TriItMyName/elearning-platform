package com.weblearning.service.impl.admin;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;

import com.weblearning.repository.admin.UserRepository;
import com.weblearning.repository.admin.RoleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.weblearning.dto.user.CreateUserRequest;
import com.weblearning.dto.user.UpdateUserRequest;
import com.weblearning.dto.user.UpdateUserStatusRequest;
import com.weblearning.dto.user.UserResponse;
import com.weblearning.entity.User;
import com.weblearning.entity.Role;
import com.weblearning.entity.enums.UserStatus;
import com.weblearning.exception.AlreadyUserException;
import com.weblearning.exception.UserNotFoundException;
import com.weblearning.service.admin.AdminUserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    // Mapping user sang userResponse để tái sử dụng cho các method khác
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .roles(user.getRoles() != null ? user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()) : Set.of())
                .build();
    }

    // Tìm user bằng id throw exception nếu không tìm thấy. Viết riêng để tái sử
    // dụng nhiều hàm
    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }

    // Tạo user của admin
    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AlreadyUserException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AlreadyUserException("Email already exists");
        }

        String requestedRoleName = request.getRole() != null && !request.getRole().trim().isEmpty()
                ? request.getRole().trim().toUpperCase()
                : "STUDENT";

        Role role = roleRepository.findByName(requestedRoleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + requestedRoleName));

        User user = User.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .status(UserStatus.ACTIVE)
                .roles(new HashSet<>(Set.of(role)))
                .build();
        User savedUser = userRepository.save(user);

        return mapToUserResponse(savedUser);
    }

    // Xóa bằng cách update trạng thái (soft delete trong truyền thuyết)
    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = findUserById(id);

        user.setStatus(UserStatus.DISABLED);
        userRepository.save(user);
    }

    // Phân trang và tìm kiếm
    @Override
    public Page<UserResponse> getAllUsers(String keyword, UserStatus status, String role, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            query.distinct(true);
            Predicate predicate = cb.conjunction();

            if (keyword != null && !keyword.trim().isEmpty()) {
                String search = "%" + keyword.trim().toLowerCase() + "%";

                Predicate usernameLike = cb.like(cb.lower(root.get("username")), search);
                Predicate fullNameLike = cb.like(cb.lower(root.get("fullName")), search);
                Predicate emailLike = cb.like(cb.lower(root.get("email")), search);

                predicate = cb.and(predicate, cb.or(usernameLike, fullNameLike, emailLike));
            }

            if (status != null) {
                predicate = cb.and(predicate, cb.equal(root.get("status"), status));
            }

            if (role != null && !role.trim().isEmpty()) {
                predicate = cb.and(predicate, cb.equal(cb.upper(root.join("roles").get("name")), role.trim().toUpperCase()));
            }

            return predicate;
        };

        return userRepository.findAll(spec, pageable).map(this::mapToUserResponse);
    }


    // tìm kiếm bằng id
    @Override
    public UserResponse getUserById(Long id) {
        User user = findUserById(id);
        return mapToUserResponse(user);
    }

    // update user
    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = findUserById(id);

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim();
            if (!user.getEmail().equals(newEmail) && userRepository.existsByEmail(newEmail)) {
                throw new AlreadyUserException("Email already exists");
            }
            user.setEmail(newEmail);
        }

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        userRepository.save(user);
        return mapToUserResponse(user);
    }

    // update status user
    @Override
    @Transactional
    public UserResponse updateUserStatus(Long id, UpdateUserStatusRequest request) {
        User user = findUserById(id);

        user.setStatus(request.getStatus());
        userRepository.save(user);
        return mapToUserResponse(user);
    }

}
