package com.swam.pricing.service;

import com.swam.pricing.domain.*;
import com.swam.pricing.repository.*;
import com.swam.pricing.dto.PriceCalculationRequest;
import com.swam.shared.dto.PriceBreakdown;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PricingEngineService {

    private final SeasonRepository seasonRepository;
    private final SeasonalRateRepository rateRepository;
    private final CityTaxRuleRepository taxRepository;

    public PriceBreakdown calculatePrice(PriceCalculationRequest request) {
        BigDecimal baseAmount = BigDecimal.ZERO;

        List<Season> relevantSeasons = seasonRepository.findSeasonsInInterval(
                request.getCheckIn(), request.getCheckOut());

        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());

        for (int i = 0; i < nights; i++) {
            LocalDate currentDate = request.getCheckIn().plusDays(i);

            // Trova stagione per la data corrente
            Season activeSeason = relevantSeasons.stream()
                    .filter(s -> !currentDate.isBefore(s.getStartDate()) && !currentDate.isAfter(s.getEndDate()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Nessuna tariffa definita per il " + currentDate));


            SeasonalRate rate = rateRepository.findBySeasonIdAndResourceId(activeSeason.getId(), request.getResourceId())
                    .orElseThrow(() -> new RuntimeException("Prezzo mancante per risorsa " + request.getResourceId()));

            BigDecimal nightlyCost = rate.getBasePrice();
            if (rate.getAdultPrice() != null) {
                nightlyCost = nightlyCost.add(rate.getAdultPrice().multiply(BigDecimal.valueOf(request.getNumAdults())));
            }
            if (rate.getChildPrice() != null) {
                nightlyCost = nightlyCost.add(rate.getChildPrice().multiply(BigDecimal.valueOf(request.getNumChildren())));
            }
            if (rate.getInfantPrice() != null && request.getNumInfants() > 0) {
                nightlyCost = nightlyCost.add(rate.getInfantPrice().multiply(BigDecimal.valueOf(request.getNumInfants())));
            }

            baseAmount = baseAmount.add(nightlyCost);
        }


        BigDecimal taxAmount = calculateCityTax(request, nights);

        BigDecimal extrasTotal = BigDecimal.ZERO;
        if (request.getExtras() != null) {
            for (PriceCalculationRequest.BillableExtraItem item : request.getExtras()) {
                if (item.getUnitPrice() != null && item.getQuantity() > 0) {
                    BigDecimal itemCost = item.getUnitPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));
                    extrasTotal = extrasTotal.add(itemCost);
                }
            }
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (request.getManualDiscount() != null) {
            discount = request.getManualDiscount();
        }

        BigDecimal deposit = BigDecimal.ZERO;
        if (request.getDepositAmount() != null) {
            deposit = request.getDepositAmount();
        }

        BigDecimal subTotal = baseAmount.add(taxAmount).add(extrasTotal);

        BigDecimal finalTotal = subTotal.subtract(discount).subtract(deposit);

        if (finalTotal.compareTo(BigDecimal.ZERO) < 0) {
            finalTotal = BigDecimal.ZERO;
        }

        return PriceBreakdown.builder()
                .baseAmount(baseAmount)
                .taxAmount(taxAmount)
                .extrasAmount(extrasTotal)
                .discountAmount(discount)
                .depositAmount(deposit)
                .finalTotal(finalTotal)
                .taxDescription(taxAmount.compareTo(BigDecimal.ZERO) > 0
                        ? "Tassa di soggiorno applicata"
                        : "Tassa di soggiorno esente o non dovuta")
                .build();
    }

    private BigDecimal calculateCityTax (PriceCalculationRequest req,long totalNights){
        if (req.isTaxExempt()) {
            return BigDecimal.ZERO;
        }

        CityTaxRule rule = taxRepository.findAll().stream().findFirst().orElse(null);

        if (rule == null || !rule.isEnabled()) {
            return BigDecimal.ZERO;
        }

        long effectiveCap;

        if (req.getManualNightsCap() != null) {
            effectiveCap = req.getManualNightsCap();
        } else {
            effectiveCap = rule.getMaxNightsCap() > 0 ? rule.getMaxNightsCap() : totalNights;
        }

        long chargeableNights = Math.min(totalNights, effectiveCap);

        if (chargeableNights <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalTax = BigDecimal.ZERO;

        if (req.getNumAdults() > 0 && rule.getAmountPerAdult() != null) {
            totalTax = totalTax.add(rule.getAmountPerAdult()
                    .multiply(BigDecimal.valueOf(req.getNumAdults()))
                    .multiply(BigDecimal.valueOf(chargeableNights)));
        }

        if (req.getNumChildren() > 0 && rule.getAmountPerChild() != null) {
            totalTax = totalTax.add(rule.getAmountPerChild()
                    .multiply(BigDecimal.valueOf(req.getNumChildren()))
                    .multiply(BigDecimal.valueOf(chargeableNights)));
        }

        if (req.getNumInfants() > 0 && rule.getAmountPerInfant() != null) {
            totalTax = totalTax.add(rule.getAmountPerInfant()
                    .multiply(BigDecimal.valueOf(req.getNumInfants()))
                    .multiply(BigDecimal.valueOf(chargeableNights)));
        }

        return totalTax;

    }
}