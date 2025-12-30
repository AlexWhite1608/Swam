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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository repository;

    @InjectMocks
    private ResourceService service;

    @Test
    @DisplayName("Create: Should succeed when name is unique")
    void createResource_ShouldSucceed_WhenNameIsUnique() {
        CreateResourceRequest request = new CreateResourceRequest();
        request.setName("Suite Test");
        request.setType(ResourceType.SUITE);
        request.setCapacity(2);

        Resource savedResource = Resource.builder()
                .id("123")
                .name("Suite Test")
                .type(ResourceType.SUITE)
                .status(ResourceStatus.AVAILABLE)
                .build();

        when(repository.existsByNameIgnoreCase(request.getName())).thenReturn(false);
        when(repository.save(any(Resource.class))).thenReturn(savedResource);

        ResourceResponse response = service.createResource(request);

        assertThat(response.getId()).isEqualTo("123");
        assertThat(response.getStatus()).isEqualTo(ResourceStatus.AVAILABLE);
        verify(repository).save(any(Resource.class));
    }

    @Test
    @DisplayName("Create: Should throw DuplicateResourceException when name exists")
    void createResource_ShouldThrowException_WhenNameExists() {
        CreateResourceRequest request = new CreateResourceRequest();
        request.setName("Suite Existent");

        // Simulate that a resource with the same name already exists
        when(repository.existsByNameIgnoreCase("Suite Existent")).thenReturn(true);

        // Attempt to create the resource and expect a DuplicateResourceException
        assertThatThrownBy(() -> service.createResource(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("già esistente");

        // Verify that save to database was never called
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Update: Should update fields when resource exists")
    void updateResource_ShouldUpdateFields_WhenResourceExists() {
        String id = "123";
        UpdateResourceRequest updateRequest = new UpdateResourceRequest();
        updateRequest.setName("Updated Name");
        updateRequest.setCapacity(5);

        Resource existingResource = Resource.builder()
                .id(id)
                .name("Old Name")
                .type(ResourceType.SUITE)
                .capacity(2)
                .build();

        when(repository.findById(id)).thenReturn(Optional.of(existingResource));

        // When saving, return the exact same resource passed in
        when(repository.save(any(Resource.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResourceResponse response = service.updateResource(id, updateRequest);

        assertThat(response.getName()).isEqualTo("Updated Name");
        assertThat(response.getCapacity()).isEqualTo(5);
        assertThat(response.getType()).isEqualTo(ResourceType.SUITE);   // not changed

        verify(repository).save(existingResource);
    }

    @Test
    @DisplayName("Update: Should throw NotFound when ID does not exist")
    void updateResource_ShouldThrow_WhenResourceNotFound() {
        when(repository.findById("999")).thenReturn(Optional.empty());

        UpdateResourceRequest request = new UpdateResourceRequest();

        assertThatThrownBy(() -> service.updateResource("999", request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Update Status: Should update status when resource exists")
    void updateStatus_ShouldUpdate_WhenResourceExists() {
        String id = "123";
        Resource existing = Resource.builder().id(id).status(ResourceStatus.AVAILABLE).build();

        when(repository.findById(id)).thenReturn(Optional.of(existing));

        service.updateStatus(id, ResourceStatus.MAINTENANCE);

        assertThat(existing.getStatus()).isEqualTo(ResourceStatus.MAINTENANCE);
        verify(repository).save(existing);
    }

    @Test
    @DisplayName("Delete: Should call deleteById when resource exists")
    void deleteResource_ShouldCallDelete_WhenResourceExists() {
        String id = "123";
        when(repository.existsById(id)).thenReturn(true);

        service.deleteResource(id);

        verify(repository).deleteById(id);
    }

    @Test
    @DisplayName("Delete: Should throw NotFound when resource does not exist")
    void deleteResource_ShouldThrow_WhenResourceNotFound() {
        String id = "999";
        when(repository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> service.deleteResource(id))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(repository, never()).deleteById(any());
    }

    @Test
    @DisplayName("GetById: Should return resource when found")
    void getById_ShouldReturnResource_WhenFound() {
        String id = "123";
        Resource mockResource = Resource.builder().id(id).name("Test").build();

        when(repository.findById(id)).thenReturn(Optional.of(mockResource));

        ResourceResponse response = service.getResourceById(id);

        assertThat(response.getId()).isEqualTo(id);
        assertThat(response.getName()).isEqualTo("Test");
    }

    @Test
    @DisplayName("GetById: Should throw NotFound when ID missing")
    void getById_ShouldThrow_WhenNotFound() {
        when(repository.findById("999")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getResourceById("999"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Availability: Should return true if status is AVAILABLE")
    void isResourceAvailable_ShouldReturnTrue_WhenAvailable() {
        String id = "123";
        Resource resource = Resource.builder().id(id).status(ResourceStatus.AVAILABLE).build();
        when(repository.findById(id)).thenReturn(Optional.of(resource));

        boolean available = service.isResourceAvailable(id);

        assertThat(available).isTrue();
    }

    @Test
    @DisplayName("Availability: Should return false if status is MAINTENANCE")
    void isResourceAvailable_ShouldReturnFalse_WhenMaintenance() {
        String id = "123";
        Resource resource = Resource.builder().id(id).status(ResourceStatus.MAINTENANCE).build();
        when(repository.findById(id)).thenReturn(Optional.of(resource));

        boolean available = service.isResourceAvailable(id);

        assertThat(available).isFalse();
    }
}