package com.weblearning.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 15, message = "Username phải có từ 3 đến 15 ký tự")
    private String username;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Password không được để trống")
    @Size(min = 6, max = 20, message = "Password phải có từ 6 đến 20 ký tự")
    private String password;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 3, max = 30, message = "Họ tên phải có từ 3 đến 30 ký tự")
    private String fullName;

    private String role;
}
