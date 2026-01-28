package com.swam.pricing.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceCalculationRequest {
    private String resourceId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private int numAdults;
    private int numChildren;
    private int numInfants;
    private boolean taxExempt;
    private BigDecimal manualDiscount;
    private BigDecimal depositAmount;
    private List<BillableExtraItem> extras;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BillableExtraItem {
        private BigDecimal unitPrice; // Prezzo al momento del consumo
        private int quantity;         // Quanti extras sono stati aggiunti
    }
}