package exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.CONFLICT, reason = "User exceeded booking limit")
public class BookingLimitExceededException extends RuntimeException {
    public BookingLimitExceededException() {
        super("User exceeded booking limit");
    }
}
