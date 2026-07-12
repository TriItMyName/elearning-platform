package com.weblearning.security;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.weblearning.configs.JwtAuthenticationFilter;
import com.weblearning.configs.JwtUtils;
import com.weblearning.dto.auth.LoginRequest;
import com.weblearning.dto.auth.RefreshTokenRequest;
import com.weblearning.entity.Permission;
import com.weblearning.entity.RefreshToken;
import com.weblearning.entity.Role;
import com.weblearning.entity.User;
import com.weblearning.entity.enums.UserStatus;
import com.weblearning.exception.AccountStatusException;
import com.weblearning.repository.AuthRepository;
import com.weblearning.repository.admin.RoleRepository;
import com.weblearning.service.RefreshTokenService;
import com.weblearning.service.impl.AuthServiceImpl;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
public class SecurityAndAuthTest {

    @Mock
    private AuthRepository authRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private AuthServiceImpl authService;

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        jwtUtils.setSecret("YYYRJ4jg1Uqdtv237iYYzss18Aaq1BQ0RQ6IjBCt85U");
        jwtUtils.setExpiration(600000L); // 10 mins
        jwtUtils.setRefreshExpiration(604800000L); // 7 days
    }

    @Test
    void jwtTokenContainsClaims() {
        List<String> roles = List.of("ADMIN", "TEACHER");
        List<String> permissions = List.of("COURSE_READ", "COURSE_WRITE");

        String token = jwtUtils.generateAccessToken("testuser", roles, permissions);

        assertTrue(jwtUtils.validateToken(token));
        assertEquals("testuser", jwtUtils.getUsernameFromToken(token));
        
        // Retrieve and check claims
        io.jsonwebtoken.Claims claims = jwtUtils.getClaimsFromToken(token);
        assertNotNull(claims);
        assertEquals(roles, claims.get("roles"));
        assertEquals(permissions, claims.get("permissions"));
    }

    @Test
    void loginBlocksLockedOrDisabledUser() {
        User lockedUser = User.builder()
                .username("lockeduser")
                .password("encoded_pass")
                .status(UserStatus.LOCKED)
                .build();

        User disabledUser = User.builder()
                .username("disableduser")
                .password("encoded_pass")
                .status(UserStatus.DISABLED)
                .build();

        when(authRepository.findByUsername("lockeduser")).thenReturn(Optional.of(lockedUser));
        when(authRepository.findByUsername("disableduser")).thenReturn(Optional.of(disabledUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        LoginRequest req1 = new LoginRequest();
        req1.setUsername("lockeduser");
        req1.setPassword("password");

        assertThrows(AccountStatusException.class, () -> authService.login(req1));

        LoginRequest req2 = new LoginRequest();
        req2.setUsername("disableduser");
        req2.setPassword("password");

        assertThrows(AccountStatusException.class, () -> authService.login(req2));
    }

    @Test
    void refreshTokenBlocksLockedOrDisabledUser() {
        User lockedUser = User.builder()
                .username("lockeduser")
                .status(UserStatus.LOCKED)
                .build();

        RefreshToken rt = RefreshToken.builder()
                .refreshToken("rt-token")
                .user(lockedUser)
                .build();

        when(refreshTokenService.verifyRefreshToken("rt-token")).thenReturn(rt);

        RefreshTokenRequest req = new RefreshTokenRequest();
        req.setRefreshToken("rt-token");

        assertThrows(AccountStatusException.class, () -> authService.refreshToken(req));
    }

    @Test
    void filterSetsAuthenticationForActiveUser() throws ServletException, IOException {
        String token = jwtUtils.generateAccessToken("activeuser", List.of("ROLE_USER"), List.of());
        
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);
        UserDetailsService userDetailsService = mock(UserDetailsService.class);
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        
        UserDetails userDetails = org.springframework.security.core.userdetails.User.withUsername("activeuser")
                .password("pass")
                .authorities("ROLE_USER")
                .disabled(false) // enabled is true
                .build();
        when(userDetailsService.loadUserByUsername("activeuser")).thenReturn(userDetails);
        
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        
        class TestFilter extends JwtAuthenticationFilter {
            public TestFilter(JwtUtils utils, UserDetailsService uds) {
                super(utils, uds);
            }
            public void run(HttpServletRequest req, HttpServletResponse res, FilterChain fc) throws ServletException, IOException {
                this.doFilterInternal(req, res, fc);
            }
        }
        
        TestFilter filter = new TestFilter(jwtUtils, userDetailsService);
        filter.run(request, response, filterChain);
        
        assertNotNull(org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication());
        assertEquals("activeuser", org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void filterSkipsAuthenticationForDisabledUser() throws ServletException, IOException {
        String token = jwtUtils.generateAccessToken("disableduser", List.of("ROLE_USER"), List.of());
        
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);
        UserDetailsService userDetailsService = mock(UserDetailsService.class);
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        
        UserDetails userDetails = org.springframework.security.core.userdetails.User.withUsername("disableduser")
                .password("pass")
                .authorities("ROLE_USER")
                .disabled(true) // enabled is false
                .build();
        when(userDetailsService.loadUserByUsername("disableduser")).thenReturn(userDetails);
        
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        
        class TestFilter extends JwtAuthenticationFilter {
            public TestFilter(JwtUtils utils, UserDetailsService uds) {
                super(utils, uds);
            }
            public void run(HttpServletRequest req, HttpServletResponse res, FilterChain fc) throws ServletException, IOException {
                this.doFilterInternal(req, res, fc);
            }
        }
        
        TestFilter filter = new TestFilter(jwtUtils, userDetailsService);
        filter.run(request, response, filterChain);
        
        assertNull(org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }
}
