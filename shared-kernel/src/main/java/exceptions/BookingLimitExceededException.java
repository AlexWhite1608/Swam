package exceptions;

import org.springframework.http.HttpStatus;

public class BookingLimitExceededException extends DomainException {

    public BookingLimitExceededException(String userId, int limit) {
        super(
            String.format("L'utente %s ha superato il limite di prenotazioni (%d)", userId, limit),
            "BOOKING_LIMIT_EXCEEDED",
            HttpStatus.CONFLICT
        );
    }
}
