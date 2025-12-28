package exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.CONFLICT, reason = "Resource with same identifier already exists")
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException() {
        super("Resource with same identifier already exists");
    }
}
