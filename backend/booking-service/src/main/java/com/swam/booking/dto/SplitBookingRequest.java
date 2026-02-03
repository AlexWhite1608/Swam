package com.swam.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

// request to split a booking into two separate bookings at a specified date, assigning the new booking to a different resource
@Data
public class SplitBookingRequest {
    @NotNull()
    private LocalDate splitDate; // Date at which to split the booking

    @NotNull()
    private String newResourceId;
}