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
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PricingEngineServiceTest {

    @Mock private SeasonRepository seasonRepository;
    @Mock private SeasonalRateRepository rateRepository;
    @Mock private CityTaxRuleRepository taxRepository;

    @InjectMocks
    private PricingEngineService pricingEngineService;

    private Season bassaStagione;
    private Season altaStagione;
    private SeasonalRate tariffaBassa;
    private SeasonalRate tariffaAlta;
    private CityTaxRule regoleTassa;

    @BeforeEach
    void setup() {
        bassaStagione = new Season();
        bassaStagione.setId("S1");
        bassaStagione.setName("Bassa Gennaio");
        bassaStagione.setStartDate(LocalDate.of(2024, 1, 1));
        bassaStagione.setEndDate(LocalDate.of(2024, 1, 29));

        altaStagione = new Season();
        altaStagione.setId("S2");
        altaStagione.setName("Alta Carnevale");
        altaStagione.setStartDate(LocalDate.of(2024, 1, 30));
        altaStagione.setEndDate(LocalDate.of(2024, 2, 10));

        tariffaBassa = new SeasonalRate();
        tariffaBassa.setSeasonId("S1");
        tariffaBassa.setBasePrice(new BigDecimal("100.00"));
        tariffaBassa.setAdultPrice(new BigDecimal("10.00"));

        tariffaAlta = new SeasonalRate();
        tariffaAlta.setSeasonId("S2");
        tariffaAlta.setBasePrice(new BigDecimal("200.00"));
        tariffaAlta.setAdultPrice(new BigDecimal("20.00"));

        regoleTassa = new CityTaxRule();
        regoleTassa.setEnabled(true);
        regoleTassa.setMaxNightsCap(4);
        regoleTassa.setAmountPerAdult(new BigDecimal("2.50"));
        regoleTassa.setAmountPerInfant(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Test Multi-Stagione: Prenotazione a cavallo tra Bassa e Alta stagione")
    void testCalculatePrice_CrossSeason() {
        System.out.println("--- INIZIO TEST: Scambio Stagione (Daily Loop) ---");

        LocalDate checkIn = LocalDate.of(2024, 1, 28);
        LocalDate checkOut = LocalDate.of(2024, 2, 2);

        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut))
                .thenReturn(Arrays.asList(bassaStagione, altaStagione));

        when(rateRepository.findBySeasonIdAndResourceId("S1", "ROOM-101")).thenReturn(Optional.of(tariffaBassa));
        when(rateRepository.findBySeasonIdAndResourceId("S2", "ROOM-101")).thenReturn(Optional.of(tariffaAlta));

        when(taxRepository.findAll()).thenReturn(List.of(regoleTassa));

        PriceCalculationRequest request = new PriceCalculationRequest();
        request.setResourceId("ROOM-101");
        request.setCheckIn(checkIn);
        request.setCheckOut(checkOut);
        request.setNumAdults(2);
        request.setNumChildren(0);

        PriceBreakdown result = pricingEngineService.calculatePrice(request);

        BigDecimal expectedRoomTotal = new BigDecimal("960.00");
        BigDecimal expectedTax = new BigDecimal("20.00");

        System.out.println("Risultato BaseAmount Calcolato: " + result.getBaseAmount());
        System.out.println("Risultato TaxAmount Calcolato: " + result.getTaxAmount());
        System.out.println("Totale Finale: " + result.getFinalTotal());

        assertEquals(0, expectedRoomTotal.compareTo(result.getBaseAmount()), "Il costo camere non torna!");
        assertEquals(0, expectedTax.compareTo(result.getTaxAmount()), "La tassa di soggiorno non torna!");
        assertEquals(0, expectedRoomTotal.add(expectedTax).compareTo(result.getFinalTotal()), "Il totale finale è errato");

        System.out.println("--- TEST PASSATO CON SUCCESSO ---\n");
    }

    @Test
    @DisplayName("Test Tassa: Cap Manuale e Sconto Manuale")
    void testCalculatePrice_ManualOverrides() {
        System.out.println("--- INIZIO TEST: Override Manuali (Cap e Sconto) ---");

        LocalDate checkIn = LocalDate.of(2024, 1, 1);
        LocalDate checkOut = LocalDate.of(2024, 1, 2);

        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut)).thenReturn(List.of(bassaStagione));
        when(rateRepository.findBySeasonIdAndResourceId("S1", "ROOM-101")).thenReturn(Optional.of(tariffaBassa));
        when(taxRepository.findAll()).thenReturn(List.of(regoleTassa));

        PriceCalculationRequest request = new PriceCalculationRequest();
        request.setResourceId("ROOM-101");
        request.setCheckIn(checkIn);
        request.setCheckOut(checkOut);
        request.setNumAdults(2);

        request.setManualNightsCap(0);
        request.setManualDiscount(new BigDecimal("50.00"));

        PriceBreakdown result = pricingEngineService.calculatePrice(request);

        System.out.println("Tassa Calcolata (Atteso 0): " + result.getTaxAmount());
        System.out.println("Sconto Applicato: " + result.getDiscountAmount());
        System.out.println("Totale Finale (Atteso 70): " + result.getFinalTotal());

        assertEquals(BigDecimal.ZERO.doubleValue(), result.getTaxAmount().doubleValue(), 0.01);
        assertEquals(new BigDecimal("70.00").doubleValue(), result.getFinalTotal().doubleValue(), 0.01);

        System.out.println("--- TEST PASSATO CON SUCCESSO ---\n");
    }
}