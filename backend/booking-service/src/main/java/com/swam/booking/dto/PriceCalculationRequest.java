package com.swam.booking.dto;
import com.swam.shared.enums.GuestType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private List<GuestProfile> guests;
    private BigDecimal manualDiscount;
    private BigDecimal depositAmount;
    private List<BillableExtraItem> extras;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GuestProfile {
        private GuestType type;
        private boolean taxExempt;
        private String taxExemptMotivation;
        private int days;

    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BillableExtraItem {
        private BigDecimal unitPrice; // price at the time of consumption
        private int quantity;         // how many extras were added
    }
}