package com.swam.pricing.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SetRateRequest {
    private String seasonId;
    private String resourceId;

    private BigDecimal basePrice;
    private BigDecimal adultPrice;
    private BigDecimal childPrice;
    private BigDecimal infantPrice;
}