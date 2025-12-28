package com.swam.resource.dto;

import enums.ResourceStatus;
import enums.ResourceType;
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

    @Min(value = 1)
    private int capacity;

    private ResourceStatus status = ResourceStatus.AVAILABLE;
}