package com.swam.resource.domain;

import com.swam.shared.enums.ResourceStatus;
import com.swam.shared.enums.ResourceType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    @Setter
    private String name;

    @Setter
    private ResourceType type;

    @Setter
    private int capacity;

    private ResourceStatus status;

    public boolean isAvailable() {
        return this.status == ResourceStatus.AVAILABLE;
    }

    public void markAsMaintenance() {
        this.status = ResourceStatus.MAINTENANCE;
    }

    public void markAsOutOfOrder() {
        this.status = ResourceStatus.OUT_OF_ORDER;
    }

    public void markAsAvailable() {
        this.status = ResourceStatus.AVAILABLE;
    }
}