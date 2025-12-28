package exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Operation not valid for current booking state")
public class InvalidBookingStateException extends RuntimeException {
    public InvalidBookingStateException() {
        super("Operation not valid for current booking state");
    }
}
