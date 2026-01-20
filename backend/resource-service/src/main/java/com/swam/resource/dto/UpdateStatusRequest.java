package com.swam.resource.dto;

import com.swam.shared.enums.ResourceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusRequest {
    @NotNull
    private ResourceStatus status;
}
