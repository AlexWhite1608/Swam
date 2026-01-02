package com.swam.resource.dto;

import com.swam.shared.enums.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateResourceRequest {
    @NotBlank
    private String name;

    @NotNull
    private ResourceType type;

    @NotNull
    @Min(value = 1)
    private Integer capacity;
}