package com.swam.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceBreakdown {

    private BigDecimal baseAmount;

    private BigDecimal extrasAmount;

    private BigDecimal taxAmount;

    private BigDecimal discountAmount;

    private BigDecimal finalTotal;

    // textual description of the applied taxes
    private String taxDescription;
}