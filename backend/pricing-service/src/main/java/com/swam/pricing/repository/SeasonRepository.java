package com.swam.pricing.repository;

import com.swam.pricing.domain.Season;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface SeasonRepository extends MongoRepository<Season, String> {
    @Query("{ 'startDate': { $lte: ?1 }, 'endDate': { $gte: ?0 } }")
    List<Season> findOverlappingSeasons(LocalDate newStart, LocalDate newEnd);

    @Query(value = "{ 'startDate': { $lte: ?1 }, 'endDate': { $gte: ?0 } }", sort = "{ 'startDate': 1 }")
    List<Season> findSeasonsInInterval(LocalDate checkIn, LocalDate checkOut);
}