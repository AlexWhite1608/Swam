package com.swam.booking.domain;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingExtra {

    private String extraOptionId;

    // snapshot to avoid issues if ExtraOption data changes later
    @NotBlank(message = "Il nome dell'extra è obbligatorio")
    private String nameSnapshot;

    private String descriptionSnapshot;

    @NotNull(message = "Il prezzo è obbligatorio")
    private BigDecimal priceSnapshot;

    @NotNull(message = "La quantità è obbligatoria")
    @Min(value = 1, message = "La quantità deve essere almeno 1")
    private Integer quantity;
}