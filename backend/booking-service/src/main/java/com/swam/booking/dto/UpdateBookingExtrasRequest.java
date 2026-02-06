package com.swam.booking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBookingExtrasRequest {

    @Valid
    @NotNull
    private List<ExtraItem> extras;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExtraItem {
        @NotNull
        private String extraOptionId;

        @Min(1)
        private int quantity;
    }
}