package com.swam.pricing.service;

import com.swam.pricing.domain.Season;
import com.swam.pricing.dto.CreateSeasonRequest;
import com.swam.pricing.repository.SeasonRepository;
import com.swam.shared.exceptions.InvalidBookingDateException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PricingManagementServiceTest {

    @Mock
    private SeasonRepository seasonRepository;

    @InjectMocks
    private PricingManagementService managementService;

    @Test
    @DisplayName("Errore se Data Inizio dopo Data Fine")
    void testCreateSeason_InvalidDates() {
        System.out.println("--- TEST MANAGEMENT: Date Invertite ---");

        CreateSeasonRequest req = new CreateSeasonRequest();
        req.setName("Stagione Errata");
        req.setStartDate(LocalDate.of(2024, 2, 1));
        req.setEndDate(LocalDate.of(2024, 1, 1));

        Exception exception = assertThrows(InvalidBookingDateException.class, () -> {
            managementService.createSeason(req);
        });

        System.out.println("Eccezione catturata: " + exception.getMessage());
        assertEquals("La data di inizio deve essere precedente alla data di fine.", exception.getMessage());
    }

    @Test
    @DisplayName("Errore se Sovrapposizione Stagioni")
    void testCreateSeason_OverlapError() {
        System.out.println("--- TEST MANAGEMENT: Sovrapposizione Stagioni ---");

        CreateSeasonRequest req = new CreateSeasonRequest();
        req.setName("Media Stagione");
        req.setStartDate(LocalDate.of(2024, 1, 10));
        req.setEndDate(LocalDate.of(2024, 1, 20));

        Season existingSeason = new Season();
        existingSeason.setName("Bassa Stagione Esistente");

        when(seasonRepository.findOverlappingSeasons(req.getStartDate(), req.getEndDate()))
                .thenReturn(List.of(existingSeason));

        Exception exception = assertThrows(InvalidBookingDateException.class, () -> {
            managementService.createSeason(req);
        });

        System.out.println("Eccezione catturata: " + exception.getMessage());
        assertTrue(exception.getMessage().contains("sovrappongono alla stagione esistente"));

        verify(seasonRepository, never()).save(any());
    }

    @Test
    @DisplayName("Successo Creazione Stagione Valida")
    void testCreateSeason_Success() {
        System.out.println("--- TEST MANAGEMENT: Creazione OK ---");

        CreateSeasonRequest req = new CreateSeasonRequest();
        req.setName("Nuova Stagione");
        req.setStartDate(LocalDate.of(2024, 1, 1));
        req.setEndDate(LocalDate.of(2024, 1, 10));

        when(seasonRepository.findOverlappingSeasons(any(), any())).thenReturn(Collections.emptyList());
        when(seasonRepository.save(any(Season.class))).thenAnswer(i -> i.getArguments()[0]);

        Season result = managementService.createSeason(req);

        assertNotNull(result);
        assertEquals("Nuova Stagione", result.getName());
        System.out.println("Stagione creata correttamente: " + result.getName());
    }
}