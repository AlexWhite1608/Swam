package exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.CONFLICT, reason = "Requested capacity exceeds resource capacity")
public class ResourceCapacityExceededException extends RuntimeException {
    public ResourceCapacityExceededException() {
        super("Requested capacity exceeds resource capacity");
    }
}
