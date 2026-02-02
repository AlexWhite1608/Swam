package com.swam.pricing.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;

@Data
@Document(collection = "seasonal_rates")
public class SeasonalRate {
    @Id
    private String id;

    private String seasonId;
    private String resourceId;

    private BigDecimal basePrice;
    private BigDecimal adultPrice;
    private BigDecimal childPrice;
    private BigDecimal infantPrice;
}