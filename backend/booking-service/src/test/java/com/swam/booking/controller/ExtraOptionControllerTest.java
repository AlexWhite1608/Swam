package com.swam.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swam.booking.domain.ExtraOption;
import com.swam.booking.dto.CreateExtraOptionRequest;
import com.swam.booking.dto.ExtraOptionResponse;
import com.swam.booking.service.ExtraOptionService;
import com.swam.shared.enums.ExtraCategory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExtraOptionController.class)
class ExtraOptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ExtraOptionService extraOptionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/extras?includeInactive=true -> get all extras (including inactive)")
    void getExtras_ShouldReturnAll_WhenIncludeInactiveIsTrue() throws Exception {
        ExtraOptionResponse extra = ExtraOptionResponse.builder().id("1").name("Test").build();
        when(extraOptionService.getAllExtraOptions()).thenReturn(List.of(extra));

        mockMvc.perform(get("/api/extras")
                        .param("includeInactive", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].name").value("Test"));
    }

    @Test
    @DisplayName("GET /api/extras?includeInactive=false -> get only active extras")
    void getExtras_ShouldReturnActive_WhenIncludeInactiveIsFalse() throws Exception {
        ExtraOptionResponse extra = ExtraOptionResponse.builder().id("1").name("Active Only").build();
        when(extraOptionService.getAllActiveExtraOptions()).thenReturn(List.of(extra));

        mockMvc.perform(get("/api/extras")
                        .param("includeInactive", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Active Only"));
    }

    @Test
    @DisplayName("POST /api/extras -> create new extra and return 201")
    void createExtra_ShouldReturn201() throws Exception {
        CreateExtraOptionRequest request = CreateExtraOptionRequest.builder()
                .name("Dinner")
                .defaultPrice(new BigDecimal("30.00"))
                .category(ExtraCategory.FOOD_BEVERAGE)
                .isActive(true)
                .build();

        ExtraOptionResponse response = ExtraOptionResponse.builder()
                .id("123")
                .name("Dinner")
                .defaultPrice(new BigDecimal("30.00"))
                .build();

        when(extraOptionService.createExtra(any(CreateExtraOptionRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/extras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("123"))
                .andExpect(jsonPath("$.name").value("Dinner"));
    }

    @Test
    @DisplayName("POST /api/extras -> get 400 Bad Request on invalid input")
    void createExtra_ShouldReturn400_WhenInvalid() throws Exception {
        CreateExtraOptionRequest request = CreateExtraOptionRequest.builder()
                .name("")
                .defaultPrice(new BigDecimal("-10.00"))
                .build();

        mockMvc.perform(post("/api/extras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/extras/{id} -> update extra and return 200")
    void updateExtra_ShouldReturn200() throws Exception {
        String id = "123";
        CreateExtraOptionRequest request = CreateExtraOptionRequest.builder()
                .name("Updated Name")
                .defaultPrice(BigDecimal.TEN)
                .category(ExtraCategory.SERVICE)
                .build();

        ExtraOptionResponse response = ExtraOptionResponse.builder().id(id).name("Updated Name").build();

        when(extraOptionService.updateExtra(eq(id), any(CreateExtraOptionRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/extras/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }
}