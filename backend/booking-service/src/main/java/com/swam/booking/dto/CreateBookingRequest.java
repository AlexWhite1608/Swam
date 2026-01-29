package com.swam.booking.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// Partial data to create a booking, will be amplified with more details during check-in and check-out processes
public class CreateBookingRequest {

    @NotBlank(message = "Risorsa obbligatoria")
    private String resourceId;

    @NotNull(message = "Check-in obbligatorio")
    @FutureOrPresent
    private LocalDate checkIn;

    @NotNull(message = "Check-out obbligatorio")
    @FutureOrPresent
    private LocalDate checkOut;

    @NotBlank(message = "Nome obbligatorio")
    private String guestFirstName;

    @NotBlank(message = "Cognome obbligatorio")
    private String guestLastName;

    private BigDecimal depositAmount;

    @Email
    private String guestEmail;

    private String guestPhone;
}