package com.swam.shared.exceptions;

import org.springframework.http.HttpStatus;

public class PaymentFailedException extends DomainException {

    public PaymentFailedException(String paymentId, String reason) {
        super(
            String.format("Elaborazione pagamento fallita per ID %s: %s", paymentId, reason),
            "PAYMENT_FAILED",
            HttpStatus.PAYMENT_REQUIRED
        );
    }
}

