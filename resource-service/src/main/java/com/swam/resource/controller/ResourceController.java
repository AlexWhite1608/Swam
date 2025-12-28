package com.swam.resource.controller;

import com.swam.resource.dto.CreateResourceRequest;
import com.swam.resource.dto.ResourceResponse;
import com.swam.resource.dto.UpdateResourceRequest;
import com.swam.resource.service.ResourceService;
import com.swam.shared.enums.ResourceStatus;
import com.swam.shared.enums.ResourceType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService service;

    // Create new resource
    @PostMapping
    public ResponseEntity<ResourceResponse> create(@Valid @RequestBody CreateResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createResource(request));
    }

    // Get resource by ID
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getResourceById(id));
    }

    // Get resources with optional filters: type, status, name
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String name
    ) {
        // priority by name
        if (name != null) {
            return ResponseEntity.ok(List.of(service.getResourceByName(name)));
        }

        // filters by type and status
        if (type != null && status != null) {
            return ResponseEntity.ok(service.getResourcesByTypeAndStatus(type, status));
        }

        // filter by type
        if (type != null) {
            return ResponseEntity.ok(service.getResourcesByType(type));
        }

        // no filter
        return ResponseEntity.ok(service.getAllResources());
    }

    // Check resource availability by name
    @GetMapping("/available")
    public ResponseEntity<Boolean> resourceAvailable(@RequestParam String name) {
        return ResponseEntity.ok(service.isResourceAvailable(name));
    }

    // Update resource details
    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> update(@PathVariable String id, @RequestBody UpdateResourceRequest request) {
        return ResponseEntity.ok(service.updateResource(id, request));
    }

    // Update resource status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable String id, @RequestParam ResourceStatus status) {
        service.updateStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    // Delete resource by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}