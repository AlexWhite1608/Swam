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
class PricingEngineEdgeCasesTest { // <--- NUOVO NOME CLASSE

    @Mock private SeasonRepository seasonRepository;
    @Mock private SeasonalRateRepository rateRepository;
    @Mock private CityTaxRuleRepository taxRepository;

    @InjectMocks
    private PricingEngineService pricingEngineService;

    // --- TEST 1: PRENOTAZIONE LUNGA SU 3 STAGIONI (Bassa -> Media -> Alta) ---
    @Test
    @DisplayName("Edge Case: Prenotazione attraverso 3 stagioni (Bassa, Media, Alta)")
    void testTripleSeason() {
        System.out.println("--- TEST EDGE: 3 Stagioni (Bassa -> Media -> Alta) ---");

        // DATE: 10 Gen - 25 Gen (15 Notti totali)
        LocalDate checkIn = LocalDate.of(2024, 1, 10);
        LocalDate checkOut = LocalDate.of(2024, 1, 25);

        // CONFIGURAZIONE STAGIONI
        // 1. Bassa: 1-14 Gen (50€)
        Season bassa = createSeason("LOW", 2024, 1, 1, 2024, 1, 14);
        SeasonalRate rateBassa = createRate("LOW", "50.00");

        // 2. Media: 15-20 Gen (75€)
        Season media = createSeason("MID", 2024, 1, 15, 2024, 1, 20);
        SeasonalRate rateMedia = createRate("MID", "75.00");

        // 3. Alta: 21-31 Gen (100€)
        Season alta = createSeason("HIGH", 2024, 1, 21, 2024, 1, 31);
        SeasonalRate rateAlta = createRate("HIGH", "100.00");

        // MOCK
        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut)).thenReturn(List.of(bassa, media, alta));
        when(rateRepository.findBySeasonIdAndResourceId("LOW", "ROOM-1")).thenReturn(Optional.of(rateBassa));
        when(rateRepository.findBySeasonIdAndResourceId("MID", "ROOM-1")).thenReturn(Optional.of(rateMedia));
        when(rateRepository.findBySeasonIdAndResourceId("HIGH", "ROOM-1")).thenReturn(Optional.of(rateAlta));

        // Disabilitiamo tassa per pulizia calcolo
        CityTaxRule noTax = new CityTaxRule(); noTax.setEnabled(false);
        when(taxRepository.findAll()).thenReturn(List.of(noTax));

        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-1")
                .checkIn(checkIn).checkOut(checkOut)
                .numAdults(1)
                .build();

        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        // VERIFICA
        // Dal 10 al 14 (5 notti) in BASSA: 5 * 50 = 250
        // Dal 15 al 20 (6 notti) in MEDIA: 6 * 75 = 450
        // Dal 21 al 25 (4 notti) in ALTA:  4 * 100 = 400
        // TOTALE ATTESO: 1100€

        System.out.println("Totale Calcolato: " + result.getBaseAmount());
        assertEquals(new BigDecimal("1100.00"), result.getBaseAmount());
    }

    // --- TEST 2: CAPODANNO (Scavallamento Anno) ---
    @Test
    @DisplayName("Edge Case: Capodanno (Anno vecchio -> Anno nuovo)")
    void testYearCrossover() {
        System.out.println("--- TEST EDGE: Capodanno (2023 -> 2024) ---");

        // DATE: 30 Dic 2023 -> 02 Gen 2024 (3 Notti)
        LocalDate checkIn = LocalDate.of(2023, 12, 30);
        LocalDate checkOut = LocalDate.of(2024, 1, 2);

        // STAGIONI
        // Dicembre 2023 (100€)
        Season dic23 = createSeason("S-2023", 2023, 12, 1, 2023, 12, 31);
        SeasonalRate rate23 = createRate("S-2023", "100.00");

        // Gennaio 2024 (120€ - Inflazione!)
        Season gen24 = createSeason("S-2024", 2024, 1, 1, 2024, 1, 31);
        SeasonalRate rate24 = createRate("S-2024", "120.00");

        // MOCK
        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut)).thenReturn(List.of(dic23, gen24));
        when(rateRepository.findBySeasonIdAndResourceId("S-2023", "ROOM-1")).thenReturn(Optional.of(rate23));
        when(rateRepository.findBySeasonIdAndResourceId("S-2024", "ROOM-1")).thenReturn(Optional.of(rate24));

        CityTaxRule noTax = new CityTaxRule(); noTax.setEnabled(false);
        when(taxRepository.findAll()).thenReturn(List.of(noTax));

        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-1")
                .checkIn(checkIn).checkOut(checkOut).numAdults(1).build();

        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        // VERIFICA MANUALE:
        // 30 Dic (2023): 100€
        // 31 Dic (2023): 100€
        // 01 Gen (2024): 120€
        // TOTALE: 320€

        System.out.println("Totale Calcolato: " + result.getBaseAmount());
        assertEquals(new BigDecimal("320.00"), result.getBaseAmount());
    }

    // --- TEST 3: TASSA CON CAP (Soggiorno Lungo + Bambini) ---
    @Test
    @DisplayName("Edge Case: Soggiorno Lungo con Tetto Tassa (Adulti + Bambini)")
    void testTaxCapLimit() {
        System.out.println("--- TEST EDGE: Tax Cap (10 notti, pago solo 4) con Bambini ---");

        LocalDate checkIn = LocalDate.of(2024, 5, 1);
        LocalDate checkOut = LocalDate.of(2024, 5, 11); // 10 NOTTI totali

        Season season = createSeason("MAY", 2024, 5, 1, 2024, 5, 31);
        SeasonalRate rate = createRate("MAY", "100.00");

        // CONFIGURAZIONE TASSA
        CityTaxRule taxRule = new CityTaxRule();
        taxRule.setEnabled(true);
        taxRule.setMaxNightsCap(4); // <--- CAP A 4 NOTTI

        // Tariffe differenziate
        taxRule.setAmountPerAdult(new BigDecimal("2.00")); // 2€ per Adulto
        taxRule.setAmountPerChild(new BigDecimal("1.00")); // 1€ per Bambino (NUOVO)

        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut)).thenReturn(List.of(season));
        when(rateRepository.findBySeasonIdAndResourceId("MAY", "ROOM-1")).thenReturn(Optional.of(rate));
        when(taxRepository.findAll()).thenReturn(List.of(taxRule));

        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-1")
                .checkIn(checkIn).checkOut(checkOut)
                .numAdults(2)   // 2 Adulti
                .numChildren(1) // 1 Bambino (NUOVO)
                .build();

        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        // VERIFICA TASSA (Matematica):
        // Notti Totali: 10
        // Notti Tassabili: Min(10, 4) = 4 notti

        // Calcolo Adulti:  2 persone * 2.00€ * 4 notti = 16.00€
        // Calcolo Bambini: 1 persona * 1.00€ * 4 notti =  4.00€
        // -----------------------------------------------------
        // TOTALE ATTESO:   16 + 4 = 20.00€

        System.out.println("Tassa Calcolata: " + result.getTaxAmount());
        assertEquals(new BigDecimal("20.00"), result.getTaxAmount());
    }

    // --- Helper Methods per creare dati velocemente ---
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