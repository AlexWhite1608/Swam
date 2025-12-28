package exceptions;

import org.springframework.http.HttpStatus;

public class InvalidBookingDateException extends DomainException {

    public InvalidBookingDateException() {
        super(
            "La data di check-out deve essere successiva alla data di check-in",
            "INVALID_BOOKING_DATE",
            HttpStatus.BAD_REQUEST
        );
    }
}