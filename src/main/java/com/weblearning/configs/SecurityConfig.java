package com.weblearning.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

    // Hàm config hasspassword
    @Bean
    public PasswordEncoder hashPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
