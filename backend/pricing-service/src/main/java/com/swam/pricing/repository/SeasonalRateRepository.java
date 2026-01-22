package com.swam.pricing.repository;

import com.swam.pricing.domain.SeasonalRate;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface SeasonalRateRepository extends MongoRepository<SeasonalRate, String> {
    Optional<SeasonalRate> findBySeasonIdAndResourceId(String seasonId, String resourceId);
    List<SeasonalRate> findBySeasonId(String seasonId);
}