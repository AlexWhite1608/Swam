package com.swam.shared.exceptions;

import org.springframework.http.HttpStatus;

public class PricingPlanNotFoundException extends DomainException {

    public PricingPlanNotFoundException(String planId) {
        super(
            String.format("Piano tariffario non trovato con ID: %s", planId),
            "PRICING_PLAN_NOT_FOUND",
            HttpStatus.NOT_FOUND
        );
    }
}
