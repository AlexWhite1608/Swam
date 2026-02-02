package com.swam.resource.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swam.resource.dto.CreateResourceRequest;
import com.swam.resource.dto.ResourceResponse;
import com.swam.resource.dto.UpdateResourceRequest;
import com.swam.resource.dto.UpdateStatusRequest;
import com.swam.resource.service.ResourceService;
import com.swam.shared.enums.ResourceStatus;
import com.swam.shared.enums.ResourceType;
import com.swam.shared.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ResourceController.class)
class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;    // HTTP request mocking

    @Autowired
    private ObjectMapper objectMapper;  // JSON to object mapper

    @MockBean
    private ResourceService service;

    @Test
    @DisplayName("POST /api/resources -> 201 Created")
    void create_ShouldReturn201() throws Exception {
        CreateResourceRequest request = new CreateResourceRequest();
        request.setName("Suite Deluxe");
        request.setType(ResourceType.SUITE);
        request.setCapacity(4);

        ResourceResponse response = ResourceResponse.builder()
                .id("1")
                .name("Suite Deluxe")
                .type(ResourceType.SUITE)
                .status(ResourceStatus.AVAILABLE)
                .build();

        // when createResource is called with any CreateResourceRequest, return the created response object
        when(service.createResource(any())).thenReturn(response);

        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated()) // Check HTTP 201
                .andExpect(jsonPath("$.id").value("1")) // Check JSON Body
                .andExpect(jsonPath("$.name").value("Suite Deluxe"));
    }

    @Test
    @DisplayName("POST /api/resources -> 400 Bad Request on invalid input")
    void create_ShouldReturn400_WhenInvalid() throws Exception {
        // empty request to simulate invalid input (trigger @Valid)
        CreateResourceRequest request = new CreateResourceRequest();

        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()); // Check HTTP 400
    }

    @Test
    @DisplayName("GET /api/resources/{id} -> 200 OK")
    void getById_ShouldReturn200() throws Exception {
        ResourceResponse response = ResourceResponse.builder().id("123").name("Test").build();

        when(service.getResourceById("123")).thenReturn(response);

        mockMvc.perform(get("/api/resources/123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test"));
    }

    @Test
    @DisplayName("GET /api/resources/{id} -> 404 Not Found")
    void getById_ShouldReturn404() throws Exception {
        when(service.getResourceById("999"))
                .thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(get("/api/resources/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").exists());
    }

    @Test
    @DisplayName("GET /api/resources (Search) -> 200 OK List")
    void searchResources_ShouldReturnList() throws Exception {
        when(service.getAllResources()).thenReturn(List.of(
                ResourceResponse.builder().id("1").name("A").build(),
                ResourceResponse.builder().id("2").name("B").build()
        ));

        mockMvc.perform(get("/api/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].name").value("A"));
    }

    @Test
    @DisplayName("GET /api/resources/{id}/available -> 200 Boolean")
    void checkAvailability_ShouldReturnTrue() throws Exception {
        when(service.isResourceAvailable("123")).thenReturn(true);

        mockMvc.perform(get("/api/resources/123/available"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    @DisplayName("PUT /api/resources/{id} -> 200 OK")
    void update_ShouldReturn200() throws Exception {
        UpdateResourceRequest request = new UpdateResourceRequest();
        request.setName("New Name");

        ResourceResponse response = ResourceResponse.builder().id("1").name("New Name").build();

        when(service.updateResource(eq("1"), any())).thenReturn(response);

        mockMvc.perform(put("/api/resources/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Name"));
    }

    @Test
    @DisplayName("PATCH /api/resources/{id}/status -> 204 No Content")
    void updateStatus_ShouldReturn204() throws Exception {
        UpdateStatusRequest request = new UpdateStatusRequest();
        request.setStatus(ResourceStatus.MAINTENANCE);

        mockMvc.perform(patch("/api/resources/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent()); // 204
    }

    @Test
    @DisplayName("DELETE /api/resources/{id} -> 204 No Content")
    void delete_ShouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/resources/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/resources/{id} -> 404 Not Found")
    void delete_ShouldReturn404() throws Exception {
        doThrow(new ResourceNotFoundException("Resource not found"))
                .when(service).deleteResource("999");

        mockMvc.perform(delete("/api/resources/999"))
                .andExpect(status().isNotFound());
    }
}