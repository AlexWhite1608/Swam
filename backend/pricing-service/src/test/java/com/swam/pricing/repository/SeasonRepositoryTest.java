package com.swam.pricing.repository;

import com.swam.pricing.domain.Season;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataMongoTest // Avvia un MongoDB "embedded" (temporaneo in memoria) solo per il test
class SeasonRepositoryTest {

    @Autowired
    private SeasonRepository seasonRepository;

    @Test
    @DisplayName("Test Query Overlap: Deve trovare stagioni sovrapposte")
    void testFindOverlappingSeasons() {
        // 1. Salviamo una stagione vera nel DB temporaneo
        Season season = new Season();
        season.setName("Gennaio");
        season.setStartDate(LocalDate.of(2024, 1, 1));
        season.setEndDate(LocalDate.of(2024, 1, 31));
        seasonRepository.save(season);

        // 2. Cerchiamo una sovrapposizione (es. 15 Gennaio - 20 Gennaio)
        List<Season> result = seasonRepository.findOverlappingSeasons(
                LocalDate.of(2024, 1, 15),
                LocalDate.of(2024, 1, 20)
        );

        // 3. Verifica
        assertFalse(result.isEmpty(), "Doveva trovare la stagione sovrapposta!");
        assertEquals("Gennaio", result.get(0).getName());

        System.out.println("Query MongoDB eseguita con successo: Trovata " + result.get(0).getName());
    }
}