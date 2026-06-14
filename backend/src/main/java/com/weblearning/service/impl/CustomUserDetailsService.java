package com.weblearning.service.impl;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.weblearning.entity.Permission;
import com.weblearning.entity.Role;
import com.weblearning.entity.User;
import com.weblearning.entity.enums.UserStatus;
import com.weblearning.repository.AuthRepository;

import lombok.RequiredArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AuthRepository authRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = authRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + username));

        Set<GrantedAuthority> authorities = new HashSet<>();
        if (user.getRoles() != null) {
            for (Role role : user.getRoles()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().trim().toUpperCase()));
                if (role.getPermissions() != null) {
                    for (Permission permission : role.getPermissions()) {
                        authorities.add(new SimpleGrantedAuthority(permission.getName().trim().toUpperCase()));
                    }
                }
            }
        }

        return org.springframework.security.core.userdetails.User.withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(authorities)
                .disabled(user.getStatus() != UserStatus.ACTIVE)
                .build();
    }
}
