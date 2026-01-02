package com.swam.resource.repository;

import com.swam.resource.domain.Resource;
import com.swam.shared.enums.ResourceStatus;
import com.swam.shared.enums.ResourceType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataMongoTest
class ResourceRepositoryTest {

    @Autowired
    private ResourceRepository repository;

    @AfterEach
    void tearDown() {
        repository.deleteAll();
    }

    @Test
    @DisplayName("Check: findByTypeAndStatus returns correct resources")
    void findByTypeAndStatus_ShouldReturnMatchingResources() {
        // target resource to be found
        Resource target = Resource.builder()
                .name("Suite Royal")
                .type(ResourceType.SUITE)
                .status(ResourceStatus.AVAILABLE)
                .capacity(4)
                .build();

        // wrong status resource
        Resource wrongStatus = Resource.builder()
                .name("Suite Maintenance")
                .type(ResourceType.SUITE)
                .status(ResourceStatus.MAINTENANCE) // different status
                .capacity(2)
                .build();

        // wrong type resource
        Resource wrongType = Resource.builder()
                .name("Pitch A")
                .type(ResourceType.CAMPSITE_PITCH) // different type
                .status(ResourceStatus.AVAILABLE)
                .capacity(6)
                .build();

        repository.saveAll(List.of(target, wrongStatus, wrongType));

        List<Resource> results = repository.findByTypeAndStatus(ResourceType.SUITE, ResourceStatus.AVAILABLE);

        assertThat(results).hasSize(1);

        assertThat(results.get(0).getName()).isEqualTo("Suite Royal");
    }

    @Test
    @DisplayName("Check: existsByNameIgnoreCase ignores casing")
    void existsByNameIgnoreCase_ShouldReturnTrue_EvenWithWeirdCasing() {
        Resource r = Resource.builder().name("Vista Mare").build();
        repository.save(r);

        boolean exists = repository.existsByNameIgnoreCase("vIsTa mArE");

        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Check: findByNameIgnoreCase ignores casing")
    void findByNameIgnoreCase_ShouldReturnResource_EvenWithWeirdCasing() {
        Resource r = Resource.builder().name("Mountain View").build();
        repository.save(r);

        Resource result = repository.findByNameIgnoreCase("mOuNtAiN vIeW").orElse(null);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Mountain View");
    }

    @Test
    @DisplayName("Check: findByType returns list")
    void findByType_ShouldReturnAllResourcesOfThatType() {
        Resource r1 = Resource.builder().name("A").type(ResourceType.DOUBLE_ROOM).build();
        Resource r2 = Resource.builder().name("B").type(ResourceType.DOUBLE_ROOM).build();
        Resource r3 = Resource.builder().name("C").type(ResourceType.SUITE).build();

        repository.saveAll(List.of(r1, r2, r3));

        List<Resource> results = repository.findByType(ResourceType.DOUBLE_ROOM);

        assertThat(results).hasSize(2);
        assertThat(results).extracting(Resource::getName).containsExactlyInAnyOrder("A", "B");
    }
}