package com.swam.pricing.service;

import com.swam.pricing.domain.*;
import com.swam.pricing.dto.*;
import com.swam.pricing.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PricingManagementService {

    private final SeasonRepository seasonRepository;
    private final SeasonalRateRepository rateRepository;
    private final CityTaxRuleRepository taxRepository;

    public Season createSeason(CreateSeasonRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("La data di inizio deve essere precedente alla data di fine.");
        }

        List<Season> overlaps = seasonRepository.findOverlappingSeasons(request.getStartDate(), request.getEndDate());
        if (!overlaps.isEmpty()) {
            throw new IllegalArgumentException("Errore: Le date indicate si sovrappongono alla stagione esistente: " + overlaps.get(0).getName());
        }

        Season season = new Season();
        season.setName(request.getName());
        season.setStartDate(request.getStartDate());
        season.setEndDate(request.getEndDate());

        return seasonRepository.save(season);
    }

    public List<Season> getAllSeasons() {
        return seasonRepository.findAll();
    }

    public void deleteSeason(String seasonId) {
        seasonRepository.deleteById(seasonId);
    }


    public SeasonalRate setRate(SetRateRequest request) {
        Optional<SeasonalRate> existing = rateRepository.findBySeasonIdAndResourceId(
                request.getSeasonId(), request.getResourceId());

        SeasonalRate rate;
        if (existing.isPresent()) {
            rate = existing.get();
        } else {
            rate = new SeasonalRate();
            rate.setSeasonId(request.getSeasonId());
            rate.setResourceId(request.getResourceId());
        }

        rate.setBasePrice(request.getBasePrice());
        rate.setAdultPrice(request.getAdultPrice());
        rate.setChildPrice(request.getChildPrice());
        rate.setInfantPrice(request.getInfantPrice());

        return rateRepository.save(rate);
    }


    public CityTaxRule updateCityTax(CityTaxConfig config) {
        taxRepository.deleteAll();

        CityTaxRule rule = new CityTaxRule();
        rule.setEnabled(config.isEnabled());
        rule.setAmountPerAdult(config.getAmountPerAdult());
        rule.setAmountPerChild(config.getAmountPerChild());
        rule.setAmountPerInfant(config.getAmountPerInfant());
        rule.setMinAge(config.getMinAge());
        rule.setMaxNightsCap(config.getMaxNightsCap());

        return taxRepository.save(rule);
    }

    public CityTaxRule getCityTax() {
        return taxRepository.findAll().stream().findFirst().orElse(new CityTaxRule());
    }

    public Season updateSeason(String id, Season updatedData) {
        Season existing = seasonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stagione non trovata"));

        if (!existing.getStartDate().equals(updatedData.getStartDate()) ||
                !existing.getEndDate().equals(updatedData.getEndDate())) {
            List<Season> overlaps = seasonRepository.findOverlappingSeasons(updatedData.getStartDate(), updatedData.getEndDate());
            overlaps.removeIf(s -> s.getId().equals(id));

            if (!overlaps.isEmpty()) {
                throw new IllegalArgumentException("Le nuove date si sovrappongono ad altre stagioni!");
            }
        }

        existing.setName(updatedData.getName());
        existing.setStartDate(updatedData.getStartDate());
        existing.setEndDate(updatedData.getEndDate());

        return seasonRepository.save(existing);
    }

    public List<SeasonalRate> getRatesBySeason(String seasonId) {
        return rateRepository.findBySeasonId(seasonId);
    }
}