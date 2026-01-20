package com.swam.shared.exceptions;

public class ExtraOptionNotFoundException extends DomainException {
    public ExtraOptionNotFoundException(String identifier) {
        super(
            String.format("Extra Option non trovata: %s", identifier),
            "EXTRA_OPTION_NOT_FOUND",
            org.springframework.http.HttpStatus.NOT_FOUND
        );
    }
}
