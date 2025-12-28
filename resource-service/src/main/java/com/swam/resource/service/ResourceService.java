package com.swam.resource.service;

import com.swam.resource.domain.Resource;
import com.swam.resource.dto.CreateResourceRequest;
import com.swam.resource.dto.ResourceResponse;
import com.swam.resource.dto.UpdateResourceRequest;
import com.swam.resource.repository.ResourceRepository;
import com.swam.shared.enums.ResourceStatus;
import com.swam.shared.enums.ResourceType;
import com.swam.shared.exceptions.DuplicateResourceException;
import com.swam.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResourceService {

    private final ResourceRepository repository;

    // Create resource
    public ResourceResponse createResource(CreateResourceRequest request) {
        log.info("Creating resource: {}", request.getName());

        if (repository.existsByName(request.getName())) {
            throw new DuplicateResourceException(request.getName());
        }

        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .status(ResourceStatus.AVAILABLE)
                .build();

        return mapToDto(repository.save(resource));
    }

    // Get resource by ID
    public ResourceResponse getResourceById(String id) {
        return repository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException(id));
    }

    // Get all resources
    public List<ResourceResponse> getAllResources() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Get resources by type
    public List<ResourceResponse> getResourcesByType(ResourceType type) {
        return repository.findByType(type).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Get resources by type and status
    public List<ResourceResponse> getResourcesByTypeAndStatus(ResourceType type, ResourceStatus status) {
        return repository.findByTypeAndStatus(type, status).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Get resource by name
    public ResourceResponse getResourceByName(String name) {
        return repository.findByName(name)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException(name));
    }

    // Update resource data
    public ResourceResponse updateResource(String id, UpdateResourceRequest request) {
        Resource resource = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));

        if (request.getName() != null) resource.setName(request.getName());
        if (request.getType() != null) resource.setType(request.getType());
        if (request.getCapacity() != null) resource.setCapacity(request.getCapacity());

        return mapToDto(repository.save(resource));
    }

    // Update resource status
    public void updateStatus(String id, ResourceStatus newStatus) {
        Resource resource = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));

        switch (newStatus) {
            case AVAILABLE -> resource.markAsAvailable();
            case MAINTENANCE -> resource.markAsMaintenance();
            case OUT_OF_ORDER -> resource.markAsOutOfOrder();
        }

        repository.save(resource);
    }

    // Check resource availability
    public boolean isResourceAvailable(String id) {
        Resource resource = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
        return resource.isAvailable();
    }

    // Delete resource
    public void deleteResource(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(id);
        }
        repository.deleteById(id);
    }

    // Helper method to map Resource to ResourceResponse
    private ResourceResponse mapToDto(Resource resource) {
        return ResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .status(resource.getStatus())
                .build();
    }
}