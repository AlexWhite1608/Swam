package com.swam.resource.repository;

import com.swam.resource.domain.Resource;
import com.swam.shared.enums.ResourceStatus;
import com.swam.shared.enums.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByType(ResourceType type);

    List<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status);

    Optional<Resource> findByNameIgnoreCase(String name);

    // check if a resource with the given name already exists (case-insensitive)
    boolean existsByNameIgnoreCase(String name);
}