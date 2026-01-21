package com.swam.booking.dto;

import com.swam.shared.enums.ExtraCategory;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ExtraOptionResponse {
    private String id;
    private String name;
    private String description;
    private BigDecimal defaultPrice;
    private ExtraCategory category;
    private boolean isActive;
}