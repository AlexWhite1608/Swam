package com.swam.pricing.service;

import com.swam.pricing.domain.CityTaxRule;
import com.swam.pricing.domain.Season;
import com.swam.pricing.domain.SeasonalRate;
import com.swam.pricing.dto.PriceCalculationRequest;
import com.swam.pricing.repository.CityTaxRuleRepository;
import com.swam.pricing.repository.SeasonRepository;
import com.swam.pricing.repository.SeasonalRateRepository;
import com.swam.shared.dto.PriceBreakdown;
import com.swam.shared.enums.GuestType;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PricingTestComplexScenario {

    @Mock private SeasonRepository seasonRepository;
    @Mock private SeasonalRateRepository rateRepository;
    @Mock private CityTaxRuleRepository taxRepository;

    @InjectMocks
    private PricingEngineService pricingEngineService;

    @Test
    @DisplayName("Scenario Complesso: Partenze Multiple Scalate + Prezzi Dinamici per Persona")
    void testStaggeredDeparturesWithDynamicPricing() {
        // 1. DATE: 10 Gen -> 15 Gen (5 Notti totali)
        LocalDate checkIn = LocalDate.of(2024, 1, 10);
        LocalDate checkOut = LocalDate.of(2024, 1, 15);

        // 2. MOCK STAGIONI (Cross-Season)
        // Bassa: 10, 11, 12 Gennaio (3 notti)
        Season bassa = createSeason("LOW", "2024-01-01", "2024-01-12");
        // Alta: 13, 14 Gennaio (2 notti)
        Season alta = createSeason("HIGH", "2024-01-13", "2024-01-31");

        // 3. MOCK TARIFFE (Qui la complessità aumenta!)
        // Configuro prezzi che dipendono dalle persone presenti.

        // Tariffa Bassa: Base 50€ + 10€ per Adulto + 5€ per Bambino
        SeasonalRate rateBassa = new SeasonalRate();
        rateBassa.setSeasonId("LOW");
        rateBassa.setBasePrice(new BigDecimal("50.00"));
        rateBassa.setAdultPrice(new BigDecimal("10.00"));
        rateBassa.setChildPrice(new BigDecimal("5.00"));

        // Tariffa Alta: Base 80€ + 20€ per Adulto + 10€ per Bambino
        SeasonalRate rateAlta = new SeasonalRate();
        rateAlta.setSeasonId("HIGH");
        rateAlta.setBasePrice(new BigDecimal("80.00"));
        rateAlta.setAdultPrice(new BigDecimal("20.00"));
        rateAlta.setChildPrice(new BigDecimal("10.00"));

        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut)).thenReturn(Arrays.asList(bassa, alta));
        when(rateRepository.findBySeasonIdAndResourceId("LOW", "ROOM-101")).thenReturn(Optional.of(rateBassa));
        when(rateRepository.findBySeasonIdAndResourceId("HIGH", "ROOM-101")).thenReturn(Optional.of(rateAlta));

        // 4. MOCK TASSA
        CityTaxRule taxRule = new CityTaxRule();
        taxRule.setEnabled(true);
        taxRule.setMaxNightsCap(4); // Cap a 4 notti
        taxRule.setAmountPerAdult(new BigDecimal("2.00"));
        taxRule.setAmountPerChild(new BigDecimal("1.00"));
        taxRule.setAmountPerInfant(BigDecimal.ZERO);

        lenient().when(taxRepository.findAll()).thenReturn(List.of(taxRule));

        // 5. OSPITI CON PARTENZE SCALATE
        List<PriceCalculationRequest.GuestProfile> guests = List.of(
                // Papà: Sta tutte le 5 notti (10, 11, 12, 13, 14)
                createGuest(GuestType.ADULT, false, 5),

                // Mamma (Esente): Va via 1 giorno prima. Sta 4 notti (10, 11, 12, 13)
                createGuest(GuestType.ADULT, true, 4),

                // Figlio: Va via a metà. Sta solo 2 notti (10, 11)
                createGuest(GuestType.CHILD, false, 2)
        );

        // 6. EXTRA E ACCONTO
        List<PriceCalculationRequest.BillableExtraItem> extras = List.of(
                new PriceCalculationRequest.BillableExtraItem(new BigDecimal("15.00"), 1) // Colazione Extra
        );
        BigDecimal deposit = new BigDecimal("100.00");

        // 7. BUILD REQUEST
        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-101")
                .checkIn(checkIn).checkOut(checkOut)
                .guests(guests)
                .extras(extras)
                .depositAmount(deposit)
                .build();

        // 8. ESECUZIONE
        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        printDebugInfo(result);

        // --- VERIFICA MANUALE DETTAGLIATA ---

        /* CALCOLO CAMERA (Room Rate) - Giorno per Giorno
         * -----------------------------------------------------------
         * Notte 1 (10 Gen - BASSA): Presenti: Papà, Mamma, Figlio.
         * Prezzo: 50 (Base) + 10 (Papà) + 10 (Mamma) + 5 (Figlio) = 75.00€
         *
         * Notte 2 (11 Gen - BASSA): Presenti: Papà, Mamma, Figlio.
         * Prezzo: 50 (Base) + 10 (Papà) + 10 (Mamma) + 5 (Figlio) = 75.00€
         *
         * Notte 3 (12 Gen - BASSA): Presenti: Papà, Mamma. (Figlio partito!)
         * Prezzo: 50 (Base) + 10 (Papà) + 10 (Mamma) = 70.00€
         *
         * Notte 4 (13 Gen - ALTA): Presenti: Papà, Mamma.
         * Prezzo: 80 (Base) + 20 (Papà) + 20 (Mamma) = 120.00€
         *
         * Notte 5 (14 Gen - ALTA): Presenti: Papà. (Mamma partita!)
         * Prezzo: 80 (Base) + 20 (Papà) = 100.00€
         *
         * TOTALE CAMERA: 75 + 75 + 70 + 120 + 100 = 440.00€
         */
        assertEquals(new BigDecimal("440.00"), result.getBaseAmount(), "Errore calcolo camera dinamico");

        /* CALCOLO TASSE (City Tax)
         * -----------------------------------------------------------
         * Papà: 5 notti. Cap 4. -> 4 * 2€ = 8.00€
         * Mamma: 4 notti. ESENTE. -> 0.00€
         * Figlio: 2 notti. Cap 4. -> 2 * 1€ = 2.00€
         *
         * TOTALE TASSE: 8 + 0 + 2 = 10.00€
         */
        assertEquals(new BigDecimal("10.00"), result.getTaxAmount(), "Errore calcolo tasse");

        // --- TOTALI FINALI ---
        // Lordo: 440 (Camera) + 10 (Tasse) + 15 (Extra) = 465.00€
        // Netto: 465 - 100 (Acconto) = 365.00€

        assertEquals(new BigDecimal("365.00"), result.getFinalTotal(), "Errore totale finale");
    }

    // Helpers
    private Season createSeason(String id, String start, String end) {
        Season s = new Season();
        s.setId(id);
        s.setStartDate(LocalDate.parse(start));
        s.setEndDate(LocalDate.parse(end));
        return s;
    }

    private PriceCalculationRequest.GuestProfile createGuest(GuestType type, boolean exempt, int days) {
        return PriceCalculationRequest.GuestProfile.builder()
                .type(type).taxExempt(exempt).days(days).build();
    }

    private void printDebugInfo(PriceBreakdown result) {
        System.out.println("\n============================================================");
        System.out.println("      DETTAGLIO CALCOLI (DEBUG TEST SCENARIO COMPLESSO)");
        System.out.println("============================================================");

        // SEZIONE 1: CAMERA (ROOM RATE)
        System.out.println("/* CALCOLO CAMERA (Room Rate) - Giorno per Giorno");
        System.out.println(" * -----------------------------------------------------------");
        System.out.println(" * Notte 1 (10 Gen - BASSA): Presenti: Papà, Mamma, Figlio.");
        System.out.println(" * Prezzo: 50 (Base) + 10 (Papà) + 10 (Mamma) + 5 (Figlio) = 75.00€");
        System.out.println(" *");
        System.out.println(" * Notte 2 (11 Gen - BASSA): Presenti: Papà, Mamma, Figlio.");
        System.out.println(" * Prezzo: 50 (Base) + 10 (Papà) + 10 (Mamma) + 5 (Figlio) = 75.00€");
        System.out.println(" *");
        System.out.println(" * Notte 3 (12 Gen - BASSA): Presenti: Papà, Mamma. (Figlio partito!)");
        System.out.println(" * Prezzo: 50 (Base) + 10 (Papà) + 10 (Mamma) = 70.00€");
        System.out.println(" *");
        System.out.println(" * Notte 4 (13 Gen - ALTA): Presenti: Papà, Mamma.");
        System.out.println(" * Prezzo: 80 (Base) + 20 (Papà) + 20 (Mamma) = 120.00€");
        System.out.println(" *");
        System.out.println(" * Notte 5 (14 Gen - ALTA): Presenti: Papà. (Mamma partita!)");
        System.out.println(" * Prezzo: 80 (Base) + 20 (Papà) = 100.00€");
        System.out.println(" *");
        System.out.println(" * TOTALE CAMERA REALE (Dal Service): " + result.getBaseAmount() + "€ (Atteso: 440.00€)");
        System.out.println(" */");
        System.out.println();

        // SEZIONE 2: TASSE (CITY TAX)
        System.out.println("/* CALCOLO TASSE (City Tax)");
        System.out.println(" * -----------------------------------------------------------");
        System.out.println(" * Papà: 5 notti. Cap 4. -> 4 * 2€ = 8.00€");
        System.out.println(" * Mamma: 4 notti. ESENTE. -> 0.00€");
        System.out.println(" * Figlio: 2 notti. Cap 4. -> 2 * 1€ = 2.00€");
        System.out.println(" *");
        System.out.println(" * TOTALE TASSE REALE (Dal Service): " + result.getTaxAmount() + "€ (Atteso: 10.00€)");
        System.out.println(" */");
        System.out.println();

        // SEZIONE 3: TOTALI FINALI
        System.out.println("// --- TOTALI FINALI ---");

        // Calcoliamo il lordo per la stampa (Base + Tasse + Extra)
        BigDecimal lordo = result.getBaseAmount().add(result.getTaxAmount()).add(result.getExtrasAmount());

        System.out.println("// Lordo: " + result.getBaseAmount() + " (Camera) + "
                + result.getTaxAmount() + " (Tasse) + "
                + result.getExtrasAmount() + " (Extra) = " + lordo + "€");

        System.out.println("// Netto: " + lordo + " - "
                + result.getDepositAmount() + " (Acconto) = "
                + result.getFinalTotal() + "€");

        System.out.println("============================================================\n");
    }
}