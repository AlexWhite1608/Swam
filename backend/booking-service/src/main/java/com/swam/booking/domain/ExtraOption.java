package com.swam.booking.domain;

import com.swam.shared.enums.ExtraCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "extra_options")
public class ExtraOption {

    @Id
    private String id;

    @NotBlank(message = "Il nome dell'extra è obbligatorio")
    private String name;

    private String description;

    @NotNull(message = "Il prezzo dell'extra è obbligatorio")
    @DecimalMin(value = "0.0", message = "Il prezzo non può essere negativo")
    private BigDecimal defaultPrice;

    @NotNull(message = "La categoria è obbligatoria")
    private ExtraCategory category;

    // if true, the extra option is available for selection in bookings else is deactivated
    @Builder.Default
    private boolean isActive = true;
}