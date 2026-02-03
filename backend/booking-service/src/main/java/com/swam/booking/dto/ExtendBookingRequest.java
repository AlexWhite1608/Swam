package com.swam.booking.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

// DTO for extending an existing booking
@Data
public class ExtendBookingRequest {

    @NotNull()
    private String newResourceId;

    @NotNull()
    @Future()
    private LocalDate newCheckOutDate;
}