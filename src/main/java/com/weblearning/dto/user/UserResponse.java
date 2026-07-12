package com.weblearning.dto.user;

import java.time.LocalDateTime;
import java.util.Set;

import com.weblearning.entity.enums.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private Boolean isActive;
    private UserStatus status;
    private Set<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
