package com.swam.pricing.repository;
import com.swam.pricing.domain.CityTaxRule;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CityTaxRuleRepository extends MongoRepository<CityTaxRule, String> {}