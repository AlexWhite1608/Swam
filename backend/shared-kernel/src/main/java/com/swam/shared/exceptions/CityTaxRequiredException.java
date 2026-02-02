package com.swam.shared.exceptions;

import org.springframework.http.HttpStatus;

public class CityTaxRequiredException extends DomainException {

    public CityTaxRequiredException() {
        super(
                "Impossibile calcolare il prezzo: Regola Tassa di Soggiorno mancante o disabilitata.",
                "CITY_TAX_CONFIGURATION_MISSING",
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}