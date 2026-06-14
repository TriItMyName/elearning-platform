package com.weblearning.service.impl.admin;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.weblearning.dto.user.UserResponse;
import com.weblearning.entity.Role;
import com.weblearning.entity.User;
import com.weblearning.entity.enums.UserStatus;
import com.weblearning.repository.admin.UserRepository;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminUserServiceImpl adminUserService;

    @Test
    void getAllUsersCallsRepositoryWithSpecificationAndFilters() {
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .fullName("Test User")
                .email("test@example.com")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(Role.builder().name("TEACHER").build()))
                .build();
        Page<User> page = new PageImpl<>(List.of(user));

        when(userRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        Pageable pageable = PageRequest.of(0, 10);
        Page<UserResponse> result = adminUserService.getAllUsers("test", UserStatus.ACTIVE, "TEACHER", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("testuser", result.getContent().get(0).getUsername());
        verify(userRepository).findAll(any(Specification.class), any(Pageable.class));
    }
}
