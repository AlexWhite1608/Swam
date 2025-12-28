package exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR, reason = "Error calculating tax")
public class TaxCalculationException extends RuntimeException {
    public TaxCalculationException() {
        super("Error calculating tax");
    }
}
