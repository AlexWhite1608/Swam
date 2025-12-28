package exceptions;

import org.springframework.http.HttpStatus;

public class GuestNotFoundException extends DomainException {

    public GuestNotFoundException(String guestId) {
        super(
            String.format("Ospite non trovato con ID: %s", guestId),
            "GUEST_NOT_FOUND",
            HttpStatus.NOT_FOUND
        );
    }
}
