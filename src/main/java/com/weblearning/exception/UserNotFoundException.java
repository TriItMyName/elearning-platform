package com.weblearning.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException() {
        super("Sai tên đăng nhập hoặc mật khẩu");
    }

}
