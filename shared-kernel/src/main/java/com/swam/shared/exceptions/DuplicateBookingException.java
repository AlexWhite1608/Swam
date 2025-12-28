package com.swam.shared.exceptions;

import org.springframework.http.HttpStatus;

public class DuplicateBookingException extends DomainException {

    public DuplicateBookingException(String slotKey) {
        super(
            String.format("Prenotazione già esistente per lo slot/chiave: %s", slotKey),
            "DUPLICATE_BOOKING",
            HttpStatus.CONFLICT
        );
    }
}
