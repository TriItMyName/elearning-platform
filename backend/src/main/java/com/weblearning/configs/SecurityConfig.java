package com.weblearning.configs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired(required = false)
    private JwtUtils jwtUtils;

    @Autowired(required = false)
    private UserDetailsService userDetailsService;

    // Hàm config hasspassword
    @Bean
    public PasswordEncoder hashPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    //
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // tắt CSRF cho test POST
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/refresh",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html")
                        .permitAll() // mở Swagger và các API Auth public
                        .anyRequest().authenticated() // còn lại vẫn cần login
                );

        if (jwtUtils != null && userDetailsService != null) {
            http.addFilterBefore(new JwtAuthenticationFilter(jwtUtils, userDetailsService), UsernamePasswordAuthenticationFilter.class);
        }

        return http.build();
    }
}
