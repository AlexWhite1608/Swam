package com.swam.resource.dto;

import com.swam.shared.enums.ResourceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

public class UpdateStatusRequest {
    @NotNull
    @Getter
    private ResourceStatus status;
}
