package com.swam.resource.dto;

import enums.ResourceStatus;
import enums.ResourceType;
import lombok.Data;

@Data
public class UpdateResourceRequest {
    private String name;
    private ResourceType type;
    private Integer capacity;
    private ResourceStatus status;
}