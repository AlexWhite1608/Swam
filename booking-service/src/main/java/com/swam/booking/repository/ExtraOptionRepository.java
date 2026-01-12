package com.swam.booking.repository;

import com.swam.booking.domain.ExtraOption;
import com.swam.shared.enums.ExtraCategory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExtraOptionRepository extends MongoRepository<ExtraOption, String> {

    // find all active extra options
    List<ExtraOption> findByIsActiveTrue();

    // find extra options by category (regardless of active status)
    List<ExtraOption> findByCategory(ExtraCategory category);
}
