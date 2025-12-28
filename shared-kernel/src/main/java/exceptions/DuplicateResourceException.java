package exceptions;

import org.springframework.http.HttpStatus;

public class DuplicateResourceException extends DomainException {

    public DuplicateResourceException(String identifier) {
        super(
            String.format("Risorsa con lo stesso identificatore già esistente: %s", identifier),
            "DUPLICATE_RESOURCE",
            HttpStatus.CONFLICT
        );
    }
}
