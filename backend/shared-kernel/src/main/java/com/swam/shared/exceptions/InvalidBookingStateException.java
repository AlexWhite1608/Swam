package com.swam.shared.exceptions;

import org.springframework.http.HttpStatus;

public class InvalidBookingStateException extends DomainException {

    public InvalidBookingStateException(String currentState, String operation) {
        super(
            String.format("Operazione '%s' non valida per lo stato corrente della prenotazione: %s", operation, currentState),
            "INVALID_BOOKING_STATE",
            HttpStatus.BAD_REQUEST
        );
    }
}
