package exceptions;

import org.springframework.http.HttpStatus;

public class InvalidGuestDataException extends DomainException {

    public InvalidGuestDataException(String fieldName, String reason) {
        super(
            String.format("Dato ospite non valido per il campo '%s': %s", fieldName, reason),
            "INVALID_GUEST_DATA",
            HttpStatus.BAD_REQUEST
        );
    }
}
