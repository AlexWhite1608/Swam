package com.swam.booking.domain;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Builder(toBuilder = true)
@Value
public class BookingExtra {

    String extraOptionId;

    @NotBlank(message = "Il nome dell'extra è obbligatorio")
    String nameSnapshot;

    String descriptionSnapshot;

    @NotNull(message = "Il prezzo è obbligatorio")
    BigDecimal priceSnapshot;

    @NotNull(message = "La quantità è obbligatoria")
    @Min(value = 1, message = "La quantità deve essere almeno 1")
    Integer quantity;
}