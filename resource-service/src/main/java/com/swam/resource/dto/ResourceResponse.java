package com.swam.resource.dto;

import com.swam.shared.enums.ResourceStatus;
import com.swam.shared.enums.ResourceType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResourceResponse {
    private String id;
    private String name;
    private ResourceType type;
    private int capacity;
    private ResourceStatus status;
}