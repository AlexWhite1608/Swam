package com.swam.pricing.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swam.pricing.domain.*;
import com.swam.pricing.dto.*;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PricingController.class)
class PricingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PricingEngineService engineService;

    @MockBean
    private PricingManagementService managementService;

    @Autowired
    private ObjectMapper objectMapper;

    // ===================================================================================
    // SEASONS CRUD TESTS
    // ===================================================================================

    @Test
    @DisplayName("POST /seasons - Create Season")
    void createSeason() throws Exception {
        CreateSeasonRequest request = new CreateSeasonRequest();
        request.setName("Summer 2024");
        request.setStartDate(LocalDate.of(2024, 6, 1));
        request.setEndDate(LocalDate.of(2024, 8, 31));

        Season mockSeason = new Season();
        mockSeason.setId("s1");
        mockSeason.setName(request.getName());

        when(managementService.createSeason(any(CreateSeasonRequest.class))).thenReturn(mockSeason);

        mockMvc.perform(post("/api/pricing/seasons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("s1"))
                .andExpect(jsonPath("$.name").value("Summer 2024"));
    }

    @Test
    @DisplayName("PUT /seasons/{id} - Update Season")
    void updateSeason() throws Exception {
        String seasonId = "s1";
        CreateSeasonRequest request = new CreateSeasonRequest();
        request.setName("Summer Updated");
        request.setStartDate(LocalDate.of(2024, 6, 1));
        request.setEndDate(LocalDate.of(2024, 9, 1));

        Season updatedSeason = new Season();
        updatedSeason.setId(seasonId);
        updatedSeason.setName("Summer Updated");

        // Nota: Il controller crea un nuovo oggetto Season dai dati della request prima di passarlo al service
        when(managementService.updateSeason(eq(seasonId), any(Season.class))).thenReturn(updatedSeason);

        mockMvc.perform(put("/api/pricing/seasons/{id}", seasonId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Summer Updated"));
    }

    @Test
    @DisplayName("GET /seasons - Get All Seasons")
    void getAllSeasons() throws Exception {
        Season s1 = new Season(); s1.setId("s1");
        when(managementService.getAllSeasons()).thenReturn(List.of(s1));

        mockMvc.perform(get("/api/pricing/seasons"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("s1"));
    }

    @Test
    @DisplayName("DELETE /seasons/{id} - Delete Season")
    void deleteSeason() throws Exception {
        doNothing().when(managementService).deleteSeason("s1");

        mockMvc.perform(delete("/api/pricing/seasons/{id}", "s1"))
                .andExpect(status().isNoContent()); // 204

        verify(managementService).deleteSeason("s1");
    }

    // ===================================================================================
    // RATES CRUD TESTS
    // ===================================================================================

    @Test
    @DisplayName("POST /rates - Set Rate (Create)")
    void setRate() throws Exception {
        SetRateRequest request = new SetRateRequest();
        request.setSeasonId("s1");
        request.setResourceId("r1");
        request.setBasePrice(new BigDecimal("100.00"));

        SeasonalRate mockRate = new SeasonalRate();
        mockRate.setId("rate1");
        mockRate.setBasePrice(new BigDecimal("100.00"));

        when(managementService.setRate(any(SetRateRequest.class))).thenReturn(mockRate);

        mockMvc.perform(post("/api/pricing/rates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("rate1"))
                .andExpect(jsonPath("$.basePrice").value(100.00));
    }

    @Test
    @DisplayName("GET /rates - Get Rates by Season")
    void getRates() throws Exception {
        SeasonalRate rate = new SeasonalRate();
        rate.setId("rate1");
        when(managementService.getRatesBySeason("s1")).thenReturn(List.of(rate));

        mockMvc.perform(get("/api/pricing/rates")
                        .param("seasonId", "s1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("rate1"));
    }

    @Test
    @DisplayName("PUT /rates/{id} - Update Rate")
    void updateRate() throws Exception {
        String rateId = "rate1";
        SetRateRequest request = new SetRateRequest();
        request.setBasePrice(new BigDecimal("150.00"));

        SeasonalRate updatedRate = new SeasonalRate();
        updatedRate.setId(rateId);
        updatedRate.setBasePrice(new BigDecimal("150.00"));

        when(managementService.updateRate(eq(rateId), any(SetRateRequest.class))).thenReturn(updatedRate);

        mockMvc.perform(put("/api/pricing/rates/{id}", rateId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.basePrice").value(150.00));
    }

    @Test
    @DisplayName("DELETE /rates/{id} - Delete Rate")
    void deleteRate() throws Exception {
        doNothing().when(managementService).deleteRate("rate1");

        mockMvc.perform(delete("/api/pricing/rates/{id}", "rate1"))
                .andExpect(status().isNoContent());

        verify(managementService).deleteRate("rate1");
    }

    // ===================================================================================
    // CITY TAX TESTS
    // ===================================================================================

    @Test
    @DisplayName("PUT /city-tax - Update City Tax")
    void updateCityTax() throws Exception {
        CityTaxConfig config = new CityTaxConfig();
        config.setEnabled(true);
        config.setAmountPerAdult(new BigDecimal("2.00"));

        CityTaxRule rule = new CityTaxRule();
        rule.setEnabled(true);
        rule.setAmountPerAdult(new BigDecimal("2.00"));

        when(managementService.updateCityTax(any(CityTaxConfig.class))).thenReturn(rule);

        mockMvc.perform(put("/api/pricing/city-tax")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(config)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amountPerAdult").value(2.00));
    }

    @Test
    @DisplayName("GET /city-tax - Get City Tax")
    void getCityTax() throws Exception {
        CityTaxRule rule = new CityTaxRule();
        rule.setEnabled(true);
        when(managementService.getCityTax()).thenReturn(rule);

        mockMvc.perform(get("/api/pricing/city-tax"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true));
    }

    // ===================================================================================
    // CALCULATION TEST
    // ===================================================================================

    @Test
    @DisplayName("POST /calculate - Calculate Price")
    void calculateQuote() throws Exception {
        PriceCalculationRequest request = new PriceCalculationRequest();
        request.setResourceId("room1");
        // ... set other fields

        PriceBreakdown breakdown = PriceBreakdown.builder()
                .finalTotal(new BigDecimal("200.00"))
                .baseAmount(new BigDecimal("180.00"))
                .build();

        when(engineService.calculatePrice(any(PriceCalculationRequest.class))).thenReturn(breakdown);

        mockMvc.perform(post("/api/pricing/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.finalTotal").value(200.00));
    }
}