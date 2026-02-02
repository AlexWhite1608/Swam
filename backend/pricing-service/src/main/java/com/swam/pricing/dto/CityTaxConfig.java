package com.swam.pricing.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CityTaxConfig {
    private boolean enabled;
    private BigDecimal amountPerAdult;
    private BigDecimal amountPerChild;
    private BigDecimal amountPerInfant;
    private int minAge;
    private int maxNightsCap;
}