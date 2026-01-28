package com.swam.pricing.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swam.pricing.dto.PriceCalculationRequest;
import com.swam.pricing.service.PricingEngineService;
import com.swam.pricing.service.PricingManagementService;
import com.swam.shared.dto.PriceBreakdown;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PricingController.class)
class PricingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // --- MODIFICA QUI ---
    // Usiamo @MockitoBean invece di @MockBean
    @MockBean
    private PricingManagementService managementService;

    @MockBean
    private PricingEngineService engineService;
    // --------------------

    @Test
    @DisplayName("GET /seasons - Deve ritornare HTTP 200 e lista vuota")
    void testGetAllSeasons() throws Exception {
        when(managementService.getAllSeasons()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/pricing/seasons")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("POST /calculate - Deve ritornare il preventivo calcolato")
    void testCalculateQuote() throws Exception {
        PriceCalculationRequest request = new PriceCalculationRequest();
        request.setResourceId("ROOM-101");
        request.setCheckIn(LocalDate.now());
        request.setCheckOut(LocalDate.now().plusDays(2));

        PriceBreakdown mockResponse = PriceBreakdown.builder()
                .finalTotal(new BigDecimal("150.00"))
                .baseAmount(new BigDecimal("100.00"))
                .build();

        when(engineService.calculatePrice(any())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/pricing/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.finalTotal").value(150.00))
                .andExpect(jsonPath("$.baseAmount").value(100.00));
    }
}