package exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.CONFLICT, reason = "Overlap detected for resource {id}")
public class SlotNotAvailableException extends RuntimeException {
    public SlotNotAvailableException(String id) {
        super("Overlap detected for resource " + id);
    }
}
