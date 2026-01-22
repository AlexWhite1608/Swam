package com.swam.pricing.controller;

import com.swam.pricing.domain.*;
import com.swam.pricing.dto.*;
import com.swam.pricing.service.PricingEngineService;
import com.swam.pricing.service.PricingManagementService;
import com.swam.shared.dto.PriceBreakdown;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingEngineService engineService;
    private final PricingManagementService managementService;

    @PostMapping("/seasons")
    public ResponseEntity<Season> createSeason(@RequestBody CreateSeasonRequest request) {
        return ResponseEntity.ok(managementService.createSeason(request));
    }

    @PutMapping("/seasons/{id}")
    public ResponseEntity<Season> updateSeason(@PathVariable String id, @RequestBody CreateSeasonRequest request) {
        Season seasonData = new Season();
        seasonData.setName(request.getName());
        seasonData.setStartDate(request.getStartDate());
        seasonData.setEndDate(request.getEndDate());
        return ResponseEntity.ok(managementService.updateSeason(id, seasonData));
    }

    @GetMapping("/seasons")
    public ResponseEntity<List<Season>> getAllSeasons() {
        return ResponseEntity.ok(managementService.getAllSeasons());
    }

    @DeleteMapping("/seasons/{id}")
    public ResponseEntity<Void> deleteSeason(@PathVariable String id) {
        managementService.deleteSeason(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/rates")
    public ResponseEntity<SeasonalRate> setRate(@RequestBody SetRateRequest request) {
        return ResponseEntity.ok(managementService.setRate(request));
    }

    @GetMapping("/rates")
    public ResponseEntity<List<SeasonalRate>> getRates(@RequestParam String seasonId) {
        return ResponseEntity.ok(managementService.getRatesBySeason(seasonId));
    }

    @PutMapping("/city-tax")
    public ResponseEntity<CityTaxRule> updateCityTax(@RequestBody CityTaxConfig config) {
        return ResponseEntity.ok(managementService.updateCityTax(config));
    }

    @GetMapping("/city-tax")
    public ResponseEntity<CityTaxRule> getCityTax() {
        return ResponseEntity.ok(managementService.getCityTax());
    }

    @PostMapping("/calculate")
    public ResponseEntity<PriceBreakdown> calculateQuote(@RequestBody PriceCalculationRequest request) {
        PriceBreakdown breakdown = engineService.calculatePrice(request);
        return ResponseEntity.ok(breakdown);
    }
}