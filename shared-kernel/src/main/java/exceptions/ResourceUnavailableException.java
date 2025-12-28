package exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.CONFLICT, reason = "Resource currently unavailable")
public class ResourceUnavailableException extends RuntimeException {
    public ResourceUnavailableException() {
        super("Resource currently unavailable");
    }
}
