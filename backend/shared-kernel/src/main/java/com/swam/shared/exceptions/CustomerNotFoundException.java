package com.swam.shared.exceptions;

public class CustomerNotFoundException extends DomainException {
    public CustomerNotFoundException(String identifier) {
        super(
                String.format("Customer non trovato: %s", identifier),
                "CUSTOMER_NOT_FOUND",
                org.springframework.http.HttpStatus.NOT_FOUND
        );
    }
}
