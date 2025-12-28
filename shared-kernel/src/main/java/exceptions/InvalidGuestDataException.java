package exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Invalid guest data")
public class InvalidGuestDataException extends RuntimeException {
    public InvalidGuestDataException() {
        super("Invalid guest data");
    }
}
