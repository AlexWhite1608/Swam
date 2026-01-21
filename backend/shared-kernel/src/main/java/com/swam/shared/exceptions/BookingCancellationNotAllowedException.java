package com.swam.shared.exceptions;

import org.springframework.http.HttpStatus;

public class BookingCancellationNotAllowedException extends DomainException {

    public BookingCancellationNotAllowedException(String bookingState) {
        super(
            String.format("Cancellazione non permessa per lo stato della prenotazione: %s", bookingState),
            "BOOKING_CANCELLATION_NOT_ALLOWED",
            HttpStatus.FORBIDDEN
        );
    }
}
