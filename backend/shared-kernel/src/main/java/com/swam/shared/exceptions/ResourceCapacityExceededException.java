package com.swam.shared.exceptions;

import org.springframework.http.HttpStatus;

public class ResourceCapacityExceededException extends DomainException {

    public ResourceCapacityExceededException(int requested, int max) {
        super(
            String.format("Richiesta capacità %d ma il massimo è %d", requested, max),
            "RESOURCE_CAPACITY_EXCEEDED",
            HttpStatus.CONFLICT
        );
    }
}
