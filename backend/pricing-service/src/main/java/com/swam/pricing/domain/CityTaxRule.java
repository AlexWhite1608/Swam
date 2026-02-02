package com.swam.pricing.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;

@Data
@Document(collection = "city_tax_rules")
public class CityTaxRule {
    @Id
    private String id;

    private boolean enabled;
    private BigDecimal amountPerAdult;
    private BigDecimal amountPerChild;
    private BigDecimal amountPerInfant;
    private int minAge;
    private int maxNightsCap;
}