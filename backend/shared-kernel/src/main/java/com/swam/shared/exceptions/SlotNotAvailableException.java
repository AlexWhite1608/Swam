package com.swam.shared.exceptions;

import org.springframework.http.HttpStatus;

public class SlotNotAvailableException extends DomainException {

    public SlotNotAvailableException(String resourceName) {
        super(
            String.format("Sovrapposizione rilevata per la risorsa %s", resourceName),
            "SLOT_NOT_AVAILABLE",
            HttpStatus.CONFLICT
        );
    }
}
