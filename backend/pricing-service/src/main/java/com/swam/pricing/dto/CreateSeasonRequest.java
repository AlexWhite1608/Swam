package com.swam.pricing.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateSeasonRequest {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
}