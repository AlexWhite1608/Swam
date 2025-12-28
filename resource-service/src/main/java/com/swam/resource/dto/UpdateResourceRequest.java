package com.swam.resource.dto;

import com.swam.shared.enums.ResourceStatus;
import com.swam.shared.enums.ResourceType;
import lombok.Data;

@Data
public class UpdateResourceRequest {
    private String name;
    private ResourceType type;
    private Integer capacity;
    private ResourceStatus status;
}