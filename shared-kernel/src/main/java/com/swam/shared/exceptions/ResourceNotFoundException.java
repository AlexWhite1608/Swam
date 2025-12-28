package com.swam.shared.exceptions;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends DomainException {

    public ResourceNotFoundException(String identifier) {
        super(
            String.format("Risorsa non trovata: %s", identifier),
            "RESOURCE_NOT_FOUND",
            HttpStatus.NOT_FOUND
        );
    }
}
