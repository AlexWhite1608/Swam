package exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Check-out must be after check-in")
public class InvalidBookingDateException extends RuntimeException {
    public InvalidBookingDateException() {
        super("Check-out must be after check-in");
    }
}