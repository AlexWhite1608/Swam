package com.swam.pricing.service;

import com.swam.pricing.domain.*;
import com.swam.pricing.dto.PriceCalculationRequest;
import com.swam.pricing.repository.*;
import com.swam.shared.dto.PriceBreakdown;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PricingEngineEdgeCasesTest {

    @Mock private SeasonRepository seasonRepository;
    @Mock private SeasonalRateRepository rateRepository;
    @Mock private CityTaxRuleRepository taxRepository;

    @InjectMocks
    private PricingEngineService pricingEngineService;

    // --- TEST 1: PRENOTAZIONE LUNGA SU 3 STAGIONI ---
    @Test
    @DisplayName("Edge Case: Prenotazione attraverso 3 stagioni")
    void testTripleSeason() {
        mockCityTax(); // <--- FIX: Simula tassa presente (anche se a zero)

        System.out.println("--- TEST EDGE: 3 Stagioni ---");

        LocalDate checkIn = LocalDate.of(2024, 1, 10);
        LocalDate checkOut = LocalDate.of(2024, 1, 25);

        // Stagioni
        Season bassa = createSeason("LOW", 2024, 1, 1, 2024, 1, 14);
        SeasonalRate rateBassa = createRate("LOW", "50.00");

        Season media = createSeason("MID", 2024, 1, 15, 2024, 1, 20);
        SeasonalRate rateMedia = createRate("MID", "75.00");

        Season alta = createSeason("HIGH", 2024, 1, 21, 2024, 1, 31);
        SeasonalRate rateAlta = createRate("HIGH", "100.00");

        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut)).thenReturn(List.of(bassa, media, alta));
        when(rateRepository.findBySeasonIdAndResourceId("LOW", "ROOM-1")).thenReturn(Optional.of(rateBassa));
        when(rateRepository.findBySeasonIdAndResourceId("MID", "ROOM-1")).thenReturn(Optional.of(rateMedia));
        when(rateRepository.findBySeasonIdAndResourceId("HIGH", "ROOM-1")).thenReturn(Optional.of(rateAlta));

        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-1")
                .checkIn(checkIn).checkOut(checkOut)
                .numAdults(1)
                .build();

        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        System.out.println("Totale Calcolato: " + result.getBaseAmount());
        assertEquals(new BigDecimal("1100.00"), result.getBaseAmount());
    }

    // --- TEST 2: CAPODANNO ---
    @Test
    @DisplayName("Edge Case: Capodanno")
    void testYearCrossover() {
        mockCityTax(); // <--- FIX: Simula tassa presente

        System.out.println("--- TEST EDGE: Capodanno ---");

        LocalDate checkIn = LocalDate.of(2023, 12, 30);
        LocalDate checkOut = LocalDate.of(2024, 1, 2);

        Season dic23 = createSeason("S-2023", 2023, 12, 1, 2023, 12, 31);
        SeasonalRate rate23 = createRate("S-2023", "100.00");

        Season gen24 = createSeason("S-2024", 2024, 1, 1, 2024, 1, 31);
        SeasonalRate rate24 = createRate("S-2024", "120.00");

        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut)).thenReturn(List.of(dic23, gen24));
        when(rateRepository.findBySeasonIdAndResourceId("S-2023", "ROOM-1")).thenReturn(Optional.of(rate23));
        when(rateRepository.findBySeasonIdAndResourceId("S-2024", "ROOM-1")).thenReturn(Optional.of(rate24));

        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-1")
                .checkIn(checkIn).checkOut(checkOut).numAdults(1).build();

        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        System.out.println("Totale Calcolato: " + result.getBaseAmount());
        assertEquals(new BigDecimal("320.00"), result.getBaseAmount());
    }

    // --- TEST 3: TASSA CON CAP ---
    @Test
    @DisplayName("Edge Case: Tax Cap")
    void testTaxCapLimit() {
        // Qui non serve mockCityTax() perché definiamo una tassa specifica per il test
        System.out.println("--- TEST EDGE: Tax Cap ---");

        LocalDate checkIn = LocalDate.of(2024, 5, 1);
        LocalDate checkOut = LocalDate.of(2024, 5, 11);

        Season season = createSeason("MAY", 2024, 5, 1, 2024, 5, 31);
        SeasonalRate rate = createRate("MAY", "100.00");

        // CONFIGURAZIONE TASSA REALE
        CityTaxRule taxRule = new CityTaxRule();
        taxRule.setEnabled(true);
        taxRule.setMaxNightsCap(4);
        taxRule.setAmountPerAdult(new BigDecimal("2.00"));
        taxRule.setAmountPerChild(new BigDecimal("1.00"));

        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut)).thenReturn(List.of(season));
        when(rateRepository.findBySeasonIdAndResourceId("MAY", "ROOM-1")).thenReturn(Optional.of(rate));
        when(taxRepository.findAll()).thenReturn(List.of(taxRule));

        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-1")
                .checkIn(checkIn).checkOut(checkOut)
                .numAdults(2)
                .numChildren(1)
                .build();

        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        System.out.println("Tassa Calcolata: " + result.getTaxAmount());
        assertEquals(new BigDecimal("20.00"), result.getTaxAmount());
    }

    // --- HELPER FIX ---
    private void mockCityTax() {
        CityTaxRule dummyRule = new CityTaxRule();
        dummyRule.setEnabled(true); // Deve essere TRUE altrimenti lancia eccezione!
        dummyRule.setMaxNightsCap(10);
        dummyRule.setAmountPerAdult(BigDecimal.ZERO); // Mettiamo 0 per non alterare i totali base
        dummyRule.setAmountPerChild(BigDecimal.ZERO);
        dummyRule.setAmountPerInfant(BigDecimal.ZERO);

        when(taxRepository.findAll()).thenReturn(List.of(dummyRule));
    }

    private Season createSeason(String id, int y1, int m1, int d1, int y2, int m2, int d2) {
        Season s = new Season();
        s.setId(id);
        s.setStartDate(LocalDate.of(y1, m1, d1));
        s.setEndDate(LocalDate.of(y2, m2, d2));
        return s;
    }

    private SeasonalRate createRate(String seasonId, String price) {
        SeasonalRate r = new SeasonalRate();
        r.setSeasonId(seasonId);
        r.setBasePrice(new BigDecimal(price));
        r.setAdultPrice(BigDecimal.ZERO);
        return r;
    }
}