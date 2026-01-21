package com.swam.shared.exceptions;

import org.springframework.http.HttpStatus;

public class InvalidBookingDateException extends DomainException {

    public InvalidBookingDateException(String message) {
        super(
            message,
            "INVALID_BOOKING_DATE",
            HttpStatus.BAD_REQUEST
        );
    }
}