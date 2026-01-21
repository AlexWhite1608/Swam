package com.swam.booking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckOutRequest {

    @Valid
    private List<ConsumedExtra> extras;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsumedExtra {
        @NotBlank
        private String extraOptionId;
        @Min(1)
        private Integer quantity;
    }
}