package exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.FORBIDDEN, reason = "Cancellation not allowed for this booking state")
public class BookingCancellationNotAllowedException extends RuntimeException {
    public BookingCancellationNotAllowedException() {
        super("Cancellation not allowed for this booking state");
    }
}
