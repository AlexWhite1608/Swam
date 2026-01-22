package com.swam.pricing.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PriceCalculationRequest {
    private String resourceId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private int numAdults;
    private int numChildren;
    private int numInfants;
    private boolean taxExempt;
    private BigDecimal manualDiscount;
    private Integer manualNightsCap;
}