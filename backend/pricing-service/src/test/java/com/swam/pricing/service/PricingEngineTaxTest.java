package com.swam.pricing.service;

import com.swam.pricing.domain.*;
import com.swam.pricing.dto.PriceCalculationRequest;
import com.swam.pricing.repository.*;
import com.swam.shared.dto.PriceBreakdown;
import com.swam.shared.enums.GuestType;
import org.junit.jupiter.api.BeforeEach;
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
class PricingEngineTaxTest {

    @Mock private SeasonRepository seasonRepository;
    @Mock private SeasonalRateRepository rateRepository;
    @Mock private CityTaxRuleRepository taxRepository;

    @InjectMocks
    private PricingEngineService pricingEngineService;

    private CityTaxRule taxRule;
    private Season season;
    private SeasonalRate rate;

    @BeforeEach
    void setup() {
        LocalDate now = LocalDate.now();
        season = new Season();
        season.setId("S1");
        season.setStartDate(now);
        season.setEndDate(now.plusMonths(1));

        rate = new SeasonalRate();
        rate.setSeasonId("S1");
        rate.setBasePrice(new BigDecimal("100.00"));

        taxRule = new CityTaxRule();
        taxRule.setEnabled(true);
        taxRule.setMaxNightsCap(4);
        taxRule.setAmountPerAdult(new BigDecimal("2.00"));
        taxRule.setAmountPerChild(new BigDecimal("1.00"));
        taxRule.setAmountPerInfant(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Scenario Misto: 3 Adulti (1 Esente) + 1 Bambino (Pagante)")
    void testMixedExemption() {
        System.out.println("--- TEST: Gruppo Misto (Esenti + Paganti) ---");

        LocalDate checkIn = LocalDate.now();
        LocalDate checkOut = checkIn.plusDays(3); // 3 Notti

        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut)).thenReturn(List.of(season));
        when(rateRepository.findBySeasonIdAndResourceId("S1", "ROOM-1")).thenReturn(Optional.of(rate));
        when(taxRepository.findAll()).thenReturn(List.of(taxRule));

        // Creiamo la lista mista
        List<PriceCalculationRequest.GuestProfile> guests = List.of(
                // 2 Adulti paganti (3 notti)
                createGuest(GuestType.ADULT, false, 3),
                createGuest(GuestType.ADULT, false, 3),
                // 1 Adulto esente (3 notti)
                createGuest(GuestType.ADULT, true, 3),
                // 1 Bambino pagante (3 notti)
                createGuest(GuestType.CHILD, false, 3)
        );

        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-1")
                .checkIn(checkIn).checkOut(checkOut)
                .guests(guests)
                .build();

        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        // Verifica:
        // Adulti Paganti: 2 * 2€ * 3 notti = 12€
        // Bambini Paganti: 1 * 1€ * 3 notti = 3€
        // Totale: 15€
        System.out.println("Tassa Calcolata: " + result.getTaxAmount());
        assertEquals(new BigDecimal("15.00"), result.getTaxAmount());
    }

    @Test
    @DisplayName("Scenario Totale: Tutti Esenti")
    void testAllExempt() {
        System.out.println("--- TEST: Tutti Esenti ---");

        LocalDate checkIn = LocalDate.now();
        LocalDate checkOut = checkIn.plusDays(2);

        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut)).thenReturn(List.of(season));
        when(rateRepository.findBySeasonIdAndResourceId("S1", "ROOM-1")).thenReturn(Optional.of(rate));
        when(taxRepository.findAll()).thenReturn(List.of(taxRule));

        List<PriceCalculationRequest.GuestProfile> guests = List.of(
                createGuest(GuestType.ADULT, true, 2),
                createGuest(GuestType.ADULT, true, 2)
        );

        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-1")
                .checkIn(checkIn).checkOut(checkOut)
                .guests(guests)
                .build();

        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        System.out.println("Tassa Calcolata: " + result.getTaxAmount());
        assertEquals(BigDecimal.ZERO, result.getTaxAmount());
    }

    private PriceCalculationRequest.GuestProfile createGuest(GuestType type, boolean exempt, int days) {
        return PriceCalculationRequest.GuestProfile.builder()
                .type(type)
                .taxExempt(exempt)
                .days(days)
                .build();
    }
}