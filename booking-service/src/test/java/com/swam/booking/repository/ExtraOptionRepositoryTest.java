package com.swam.booking.repository;

import com.swam.booking.domain.ExtraOption;
import com.swam.shared.enums.ExtraCategory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataMongoTest
@Testcontainers
class ExtraOptionRepositoryTest {
    @Container
    @ServiceConnection
    static MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:6.0");

    @Autowired
    private ExtraOptionRepository extraOptionRepository;

    @AfterEach
    void tearDown() {
        extraOptionRepository.deleteAll();
    }

    private ExtraOption breakfast;
    private ExtraOption parking;
    private ExtraOption spa;

    @BeforeEach
    void setUp() {
        breakfast = ExtraOption.builder()
                .name("Breakfast")
                .description("Continental breakfast")
                .category(ExtraCategory.FOOD_BEVERAGE)
                .defaultPrice(BigDecimal.valueOf(15.00))
                .isActive(true)
                .build();

        parking = ExtraOption.builder()
                .name("Parking")
                .description("Private parking space")
                .category(ExtraCategory.SERVICE)
                .defaultPrice(BigDecimal.valueOf(10.00))
                .isActive(true)
                .build();

        spa = ExtraOption.builder()
                .name("Spa Access")
                .description("Full day spa access")
                .category(ExtraCategory.WELLNESS)
                .defaultPrice(BigDecimal.valueOf(50.00))
                .isActive(false)
                .build();

        extraOptionRepository.saveAll(List.of(breakfast, parking, spa));
    }

    @Test
    @DisplayName("Check: findByIsActiveTrue returns only active options")
    void findByIsActiveTrue_ShouldReturnOnlyActiveOptions() {
        List<ExtraOption> results = extraOptionRepository.findByIsActiveTrue();

        assertThat(results).hasSize(2);
        assertThat(results).extracting(ExtraOption::getName)
                .containsExactlyInAnyOrder("Breakfast", "Parking");
        assertThat(results).allMatch(ExtraOption::isActive);
    }

    @Test
    @DisplayName("Check: findByCategory returns all options in category")
    void findByCategory_ShouldReturnAllInCategory() {
        List<ExtraOption> foodResults = extraOptionRepository.findByCategory(ExtraCategory.FOOD_BEVERAGE);

        assertThat(foodResults).hasSize(1);
        assertThat(foodResults.get(0).getName()).isEqualTo("Breakfast");

        List<ExtraOption> serviceResults = extraOptionRepository.findByCategory(ExtraCategory.SERVICE);

        assertThat(serviceResults).hasSize(1);
        assertThat(serviceResults.get(0).getName()).isEqualTo("Parking");
    }

    @Test
    @DisplayName("Check: findByCategory returns inactive options too")
    void findByCategory_ShouldIncludeInactiveOptions() {
        List<ExtraOption> wellnessResults = extraOptionRepository.findByCategory(ExtraCategory.WELLNESS);

        assertThat(wellnessResults).hasSize(1);
        assertThat(wellnessResults.get(0).getName()).isEqualTo("Spa Access");
        assertThat(wellnessResults.get(0).isActive()).isFalse();
    }

    @Test
    @DisplayName("Check: findByCategory returns empty list for non-existing category")
    void findByCategory_ShouldReturnEmptyForNonExistingCategory() {
        List<ExtraOption> results = extraOptionRepository.findByCategory(ExtraCategory.ACTIVITY);

        assertThat(results).isEmpty();
    }
}
