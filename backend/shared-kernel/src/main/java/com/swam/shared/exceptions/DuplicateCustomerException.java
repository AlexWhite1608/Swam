package com.swam.shared.exceptions;

import org.springframework.http.HttpStatus;

public class DuplicateCustomerException extends DomainException {

    public DuplicateCustomerException(String identifier) {
        super(
                String.format("Customer con lo stesso identificatore già esistente: %s", identifier),
                "DUPLICATE_CUSTOMER",
                HttpStatus.CONFLICT
        );
    }
}
