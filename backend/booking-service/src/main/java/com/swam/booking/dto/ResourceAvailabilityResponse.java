package com.swam.booking.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResourceAvailabilityResponse {
    private String resourceId;
    private String resourceName;
    private boolean isAvailable;
}
