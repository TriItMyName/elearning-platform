package com.weblearning.exception;

public class AlreadyUserException extends RuntimeException {
    public AlreadyUserException() {
        super("Tài khoản đã tồn tại");
    }

}
