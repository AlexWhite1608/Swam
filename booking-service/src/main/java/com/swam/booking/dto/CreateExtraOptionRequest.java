package com.swam.booking.dto;

import com.swam.shared.enums.ExtraCategory;
import jakarta.validation.constraints.DecimalMin;
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
public class CreateExtraOptionRequest {

    @NotBlank(message = "Il nome dell'extra è obbligatorio")
    private String name;

    private String description;

    @NotNull(message = "Il prezzo è obbligatorio")
    @DecimalMin(value = "0.0", message = "Il prezzo non può essere negativo")
    private BigDecimal defaultPrice;

    @NotNull(message = "La categoria è obbligatoria")
    private ExtraCategory category;

    @Builder.Default
    private boolean isActive = true;
}