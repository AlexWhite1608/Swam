package exceptions;

import org.springframework.http.HttpStatus;

public class TaxCalculationException extends DomainException {

    public TaxCalculationException(String reason) {
        super(
            String.format("Errore nel calcolo delle tasse: %s", reason),
            "TAX_CALCULATION_ERROR",
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
