package com.weblearning.exception;

public class AlreadyUserException extends RuntimeException {
    public AlreadyUserException(String message) {
        super(message);
    }

}
