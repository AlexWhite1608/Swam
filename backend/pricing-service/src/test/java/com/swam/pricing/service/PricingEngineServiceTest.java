package com.swam.pricing.service;

import com.swam.pricing.domain.*;
import com.swam.pricing.dto.PriceCalculationRequest;
import com.swam.pricing.repository.*;
import com.swam.shared.dto.PriceBreakdown;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PricingEngineServiceTest {

    @Mock private SeasonRepository seasonRepository;
    @Mock private SeasonalRateRepository rateRepository;
    @Mock private CityTaxRuleRepository taxRepository;

    @InjectMocks
    private PricingEngineService pricingEngineService;

    // Dati per i test
    private Season bassaStagione;
    private Season altaStagione;
    private SeasonalRate tariffaBassa;
    private SeasonalRate tariffaAlta;
    private CityTaxRule regoleTassa;

    @BeforeEach
    void setup() {
        // 1. Configurazione Bassa Stagione (1-15 Gennaio)
        bassaStagione = new Season();
        bassaStagione.setId("LOW");
        bassaStagione.setName("Bassa Gennaio");
        bassaStagione.setStartDate(LocalDate.of(2024, 1, 1));
        bassaStagione.setEndDate(LocalDate.of(2024, 1, 15));

        tariffaBassa = new SeasonalRate();
        tariffaBassa.setSeasonId("LOW");
        tariffaBassa.setBasePrice(new BigDecimal("50.00")); // 50€ a notte
        tariffaBassa.setAdultPrice(BigDecimal.ZERO);

        // 2. Configurazione Alta Stagione (16-31 Gennaio)
        altaStagione = new Season();
        altaStagione.setId("HIGH");
        altaStagione.setName("Alta Gennaio");
        altaStagione.setStartDate(LocalDate.of(2024, 1, 16));
        altaStagione.setEndDate(LocalDate.of(2024, 1, 31));

        tariffaAlta = new SeasonalRate();
        tariffaAlta.setSeasonId("HIGH");
        tariffaAlta.setBasePrice(new BigDecimal("100.00")); // 100€ a notte (il doppio)
        tariffaAlta.setAdultPrice(BigDecimal.ZERO);

        // 3. Tassa Disabilitata di default (la abilitiamo solo se serve)
        regoleTassa = new CityTaxRule();
        regoleTassa.setEnabled(false);
    }

    @Test
    @DisplayName("Scenario 1: Prenotazione dentro la stessa stagione")
    void testSingleSeason() {
        System.out.println("--- TEST: Singola Stagione (Bassa) ---");

        // Prenotazione: 10 Gen -> 13 Gen (3 Notti in Bassa)
        LocalDate checkIn = LocalDate.of(2024, 1, 10);
        LocalDate checkOut = LocalDate.of(2024, 1, 13);

        // Mock DB
        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut)).thenReturn(List.of(bassaStagione));
        when(rateRepository.findBySeasonIdAndResourceId("LOW", "ROOM-101")).thenReturn(Optional.of(tariffaBassa));
        when(taxRepository.findAll()).thenReturn(List.of(regoleTassa));

        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-101")
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numAdults(2)
                .depositAmount(BigDecimal.ZERO)
                .build();

        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        // Verifica: 3 notti * 50€ = 150€
        System.out.println("Totale calcolato: " + result.getBaseAmount());
        assertEquals(new BigDecimal("150.00"), result.getBaseAmount());
        assertEquals(new BigDecimal("150.00"), result.getFinalTotal());
    }

    @Test
    @DisplayName("Scenario 2: Cross-Season (Bassa -> Alta)")
    void testCrossSeason() {
        System.out.println("--- TEST: Cambio Stagione (Cross-Season) ---");

        // Prenotazione: 14 Gen -> 17 Gen (3 Notti totali)
        // 14 Gen (Bassa - 50€)
        // 15 Gen (Bassa - 50€)
        // 16 Gen (Alta - 100€) --> Qui scatta il cambio!
        // 17 Gen (Check-out)
        LocalDate checkIn = LocalDate.of(2024, 1, 14);
        LocalDate checkOut = LocalDate.of(2024, 1, 17);

        // Mock DB: Restituisce ENTRAMBE le stagioni
        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut))
                .thenReturn(Arrays.asList(bassaStagione, altaStagione));

        // Mock Rate: Restituisce prezzi diversi in base alla stagione richiesta
        when(rateRepository.findBySeasonIdAndResourceId("LOW", "ROOM-101")).thenReturn(Optional.of(tariffaBassa));
        when(rateRepository.findBySeasonIdAndResourceId("HIGH", "ROOM-101")).thenReturn(Optional.of(tariffaAlta));

        when(taxRepository.findAll()).thenReturn(List.of(regoleTassa));

        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-101")
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numAdults(2)
                .build();

        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        // Verifica Matematica:
        // 50€ + 50€ + 100€ = 200€ Totale Base
        System.out.println("Costo Base: " + result.getBaseAmount());

        assertEquals(new BigDecimal("200.00"), result.getBaseAmount());
    }

    @Test
    @DisplayName("Scenario 3: Matematica Finanziaria (Base + Extra - Acconto)")
    void testFinancialMath() {
        System.out.println("--- TEST: Extra e Acconto ---");

        // 1 Notte in Alta Stagione (100€)
        LocalDate checkIn = LocalDate.of(2024, 1, 20);
        LocalDate checkOut = LocalDate.of(2024, 1, 21);

        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut)).thenReturn(List.of(altaStagione));
        when(rateRepository.findBySeasonIdAndResourceId("HIGH", "ROOM-101")).thenReturn(Optional.of(tariffaAlta));
        when(taxRepository.findAll()).thenReturn(List.of(regoleTassa));

        // Extra: 2 Cene da 25€ = 50€
        List<PriceCalculationRequest.BillableExtraItem> extras = new ArrayList<>();
        extras.add(new PriceCalculationRequest.BillableExtraItem(new BigDecimal("25.00"), 2));

        // Acconto: 40€ già pagati
        BigDecimal acconto = new BigDecimal("40.00");

        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-101")
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numAdults(2)
                .depositAmount(acconto)
                .extras(extras)
                .build();

        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        // Verifica:
        // Base (100) + Extra (50) - Acconto (40) = 110€ da pagare

        System.out.println("Base: " + result.getBaseAmount());
        System.out.println("Extra: " + result.getExtrasAmount());
        System.out.println("Acconto: " + result.getDepositAmount());
        System.out.println("Finale: " + result.getFinalTotal());

        assertEquals(new BigDecimal("100.00"), result.getBaseAmount());
        assertEquals(new BigDecimal("50.00"), result.getExtrasAmount());
        assertEquals(new BigDecimal("40.00"), result.getDepositAmount());
        assertEquals(new BigDecimal("110.00"), result.getFinalTotal());
    }
}