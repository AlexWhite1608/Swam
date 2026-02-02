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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.lenient;
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
        bassaStagione.setId("LOW");
        bassaStagione.setStartDate(LocalDate.of(2024, 1, 1));
        bassaStagione.setEndDate(LocalDate.of(2024, 1, 15));

        tariffaBassa = new SeasonalRate();
        tariffaBassa.setSeasonId("LOW");
        tariffaBassa.setBasePrice(new BigDecimal("50.00"));
        tariffaBassa.setAdultPrice(BigDecimal.ZERO);

        altaStagione = new Season();
        altaStagione.setId("HIGH");
        altaStagione.setStartDate(LocalDate.of(2024, 1, 16));
        altaStagione.setEndDate(LocalDate.of(2024, 1, 31));

        tariffaAlta = new SeasonalRate();
        tariffaAlta.setSeasonId("HIGH");
        tariffaAlta.setBasePrice(new BigDecimal("100.00"));
        tariffaAlta.setAdultPrice(BigDecimal.ZERO);

        regoleTassa = new CityTaxRule();
        regoleTassa.setEnabled(true);
        regoleTassa.setMaxNightsCap(4);
        regoleTassa.setAmountPerAdult(BigDecimal.ZERO);
        regoleTassa.setAmountPerChild(BigDecimal.ZERO);
        regoleTassa.setAmountPerInfant(BigDecimal.ZERO);

        lenient().when(taxRepository.findAll()).thenReturn(List.of(regoleTassa));
    }

    @Test
    @DisplayName("Scenario 1: Singola Stagione")
    void testSingleSeason() {
        System.out.println("--- TEST: Singola Stagione ---");

        LocalDate checkIn = LocalDate.of(2024, 1, 10);
        LocalDate checkOut = LocalDate.of(2024, 1, 13); // 3 notti

        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut)).thenReturn(List.of(bassaStagione));
        when(rateRepository.findBySeasonIdAndResourceId("LOW", "ROOM-101")).thenReturn(Optional.of(tariffaBassa));

        // 2 Adulti per 3 notti
        List<PriceCalculationRequest.GuestProfile> guests = List.of(
                createGuest(GuestType.ADULT, 3),
                createGuest(GuestType.ADULT, 3)
        );

        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-101")
                .checkIn(checkIn).checkOut(checkOut)
                .guests(guests)
                .depositAmount(BigDecimal.ZERO)
                .build();

        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        System.out.println("Totale calcolato: " + result.getBaseAmount());
        assertEquals(new BigDecimal("150.00"), result.getBaseAmount());
    }

    @Test
    @DisplayName("Scenario 2: Cross-Season")
    void testCrossSeason() {
        System.out.println("--- TEST: Cross-Season ---");

        LocalDate checkIn = LocalDate.of(2024, 1, 14);
        LocalDate checkOut = LocalDate.of(2024, 1, 17); // 3 Notti

        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut))
                .thenReturn(Arrays.asList(bassaStagione, altaStagione));

        when(rateRepository.findBySeasonIdAndResourceId("LOW", "ROOM-101")).thenReturn(Optional.of(tariffaBassa));
        when(rateRepository.findBySeasonIdAndResourceId("HIGH", "ROOM-101")).thenReturn(Optional.of(tariffaAlta));

        List<PriceCalculationRequest.GuestProfile> guests = List.of(
                createGuest(GuestType.ADULT, 3),
                createGuest(GuestType.ADULT, 3)
        );

        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-101")
                .checkIn(checkIn).checkOut(checkOut)
                .guests(guests)
                .build();

        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        System.out.println("Costo Base: " + result.getBaseAmount());
        assertEquals(new BigDecimal("200.00"), result.getBaseAmount());
    }

    @Test
    @DisplayName("Scenario 3: Matematica Finanziaria")
    void testFinancialMath() {
        System.out.println("--- TEST: Extra e Acconto ---");

        LocalDate checkIn = LocalDate.of(2024, 1, 20);
        LocalDate checkOut = LocalDate.of(2024, 1, 21); // 1 Notte

        when(seasonRepository.findSeasonsInInterval(checkIn, checkOut)).thenReturn(List.of(altaStagione));
        when(rateRepository.findBySeasonIdAndResourceId("HIGH", "ROOM-101")).thenReturn(Optional.of(tariffaAlta));

        List<PriceCalculationRequest.BillableExtraItem> extras = new ArrayList<>();
        extras.add(new PriceCalculationRequest.BillableExtraItem(new BigDecimal("25.00"), 2));

        List<PriceCalculationRequest.GuestProfile> guests = List.of(
                createGuest(GuestType.ADULT, 1),
                createGuest(GuestType.ADULT, 1)
        );

        PriceCalculationRequest req = PriceCalculationRequest.builder()
                .resourceId("ROOM-101")
                .checkIn(checkIn).checkOut(checkOut)
                .guests(guests)
                .depositAmount(new BigDecimal("40.00"))
                .extras(extras)
                .build();

        PriceBreakdown result = pricingEngineService.calculatePrice(req);

        System.out.println("Finale: " + result.getFinalTotal());
        assertEquals(new BigDecimal("110.00"), result.getFinalTotal());
    }

    private PriceCalculationRequest.GuestProfile createGuest(GuestType type, int days) {
        return PriceCalculationRequest.GuestProfile.builder()
                .type(type).taxExempt(false).days(days).build();
    }
}