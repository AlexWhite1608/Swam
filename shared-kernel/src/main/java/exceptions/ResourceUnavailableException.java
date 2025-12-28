package exceptions;

import org.springframework.http.HttpStatus;

public class ResourceUnavailableException extends DomainException {

    public ResourceUnavailableException(String resourceId) {
        super(
            String.format("Risorsa attualmente non disponibile: %s", resourceId),
            "RESOURCE_UNAVAILABLE",
            HttpStatus.CONFLICT
        );
    }
}
