package com.code_wizards.Backend.exception;

public class UnauthorizedCommentEditException extends RuntimeException {
    public UnauthorizedCommentEditException(String message) {
        super(message);
    }
}
