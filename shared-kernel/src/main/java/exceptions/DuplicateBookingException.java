package exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.CONFLICT, reason = "Booking already exists for given slot/key")
public class DuplicateBookingException extends RuntimeException {
    public DuplicateBookingException() {
        super("Booking already exists for given slot/key");
    }
}
