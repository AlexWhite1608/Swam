package com.swam.resource.e2e;

import com.swam.resource.dto.CreateResourceRequest;
import com.swam.resource.dto.ResourceResponse;
import com.swam.resource.dto.UpdateResourceRequest;
import com.swam.resource.repository.ResourceRepository;
import com.swam.shared.enums.ResourceStatus;
import com.swam.shared.enums.ResourceType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class ResourceEndToEndTest {

    // Downloads and starts a MongoDB 6.0 container for testing
    @Container
    @ServiceConnection
    static MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:6.0");

    @Autowired
    // http client template
    private TestRestTemplate restTemplate;

    @Autowired
    private ResourceRepository repository;

    @AfterEach
    void cleanup() {
        repository.deleteAll();
    }

    @Test
    @DisplayName("E2E: Create Resource -> Check DB -> Get Resource -> Update Resource -> Delete")
    void fullResourceLifecycle() {
        String resourceId = createResourceAndVerify();
        verifyResourceExistsInDatabase(resourceId);
        verifyGetResource(resourceId);
        updateResourceAndVerify(resourceId);
        deleteResourceAndVerify(resourceId);
    }

    // Create a resource and verify the response
    private String createResourceAndVerify() {
        CreateResourceRequest createRequest = new CreateResourceRequest();
        createRequest.setName("E2E Test Suite");
        createRequest.setType(ResourceType.SUITE);
        createRequest.setCapacity(4);

        ResponseEntity<ResourceResponse> createResponse = restTemplate.postForEntity(
                "/api/resources",
                createRequest,
                ResourceResponse.class
        );

        // check that the resource was created successfully
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResponse.getBody()).isNotNull();

        String resourceId = createResponse.getBody().getId();
        assertThat(resourceId).isNotBlank();

        return resourceId;
    }

    // Verify that the resource exists in the database with the correct status
    private void verifyResourceExistsInDatabase(String resourceId) {
        assertThat(repository.existsById(resourceId)).isTrue();
        assertThat(repository.findById(resourceId).get().getStatus()).isEqualTo(ResourceStatus.AVAILABLE);
    }

    // Verify that the resource can be retrieved via GET request
    private void verifyGetResource(String resourceId) {
        ResponseEntity<ResourceResponse> getResponse = restTemplate.getForEntity(
                "/api/resources/" + resourceId,
                ResourceResponse.class
        );

        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody().getName()).isEqualTo("E2E Test Suite");
    }

    // Update the resource and verify the changes
    private void updateResourceAndVerify(String resourceId) {
        UpdateResourceRequest updateRequest = new UpdateResourceRequest();
        updateRequest.setName("E2E Updated Name");
        updateRequest.setCapacity(10);

        ResponseEntity<ResourceResponse> updateResponse = restTemplate.exchange(
                "/api/resources/" + resourceId,
                HttpMethod.PUT,
                new org.springframework.http.HttpEntity<>(updateRequest),
                ResourceResponse.class
        );

        // check update response
        assertThat(updateResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updateResponse.getBody()).isNotNull();
        assertThat(updateResponse.getBody().getName()).isEqualTo("E2E Updated Name");
        assertThat(updateResponse.getBody().getCapacity()).isEqualTo(10);

        // check updated resource in the database
        var updatedResourceFromDb = repository.findById(resourceId).orElseThrow();
        assertThat(updatedResourceFromDb.getName()).isEqualTo("E2E Updated Name");
        assertThat(updatedResourceFromDb.getCapacity()).isEqualTo(10);
    }

    // Delete the resource and verify it no longer exists
    private void deleteResourceAndVerify(String resourceId) {
        restTemplate.delete("/api/resources/" + resourceId);

        // check 404 on get after deletion
        ResponseEntity<String> errorResponse = restTemplate.getForEntity(
                "/api/resources/" + resourceId,
                String.class
        );

        assertThat(errorResponse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

        // db must be empty
        assertThat(repository.existsById(resourceId)).isFalse();
    }
}
