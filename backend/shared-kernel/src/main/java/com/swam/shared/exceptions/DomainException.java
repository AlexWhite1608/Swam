package com.swam.shared.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class DomainException extends RuntimeException {

    private final HttpStatus httpStatus;
    private final String errorCode;

    public DomainException(String message, String errorCode, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
