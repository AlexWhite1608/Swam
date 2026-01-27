package com.swam.booking.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
// DTO representing a period during which a resource is unavailable
public class UnavailablePeriodResponse {
    private LocalDate start;
    private LocalDate end;
}