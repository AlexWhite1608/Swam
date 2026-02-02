package com.swam.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class EditBookingStayRequest {
    @NotNull()
    private String resourceId;

    @NotNull()
    private LocalDate checkIn;

    @NotNull()
    private LocalDate checkOut;
}