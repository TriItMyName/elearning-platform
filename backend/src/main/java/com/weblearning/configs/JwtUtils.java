package com.weblearning.configs;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import lombok.Data;

import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;

@Component
@ConfigurationProperties(prefix = "jwt")
@Data
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    @Value("${jwt.refresh-expiration}")
    private Long refreshExpiration;

    // Tạo key để ký token
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Tạo access token
    public String generateAccessToken(String username, java.util.List<String> roles, java.util.List<String> permissions) {
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .claim("permissions", permissions)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date().getTime()) + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    // Tạo refresh token
    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date().getTime()) + refreshExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    // Lấy thông tin username từ token
    public String getUsernameFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    // Lấy claims từ token
    public io.jsonwebtoken.Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Kiểm tra token có hợp lệ không
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
