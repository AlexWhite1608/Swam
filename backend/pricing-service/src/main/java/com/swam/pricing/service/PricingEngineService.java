package com.swam.pricing.service;

import com.swam.pricing.domain.*;
import com.swam.pricing.repository.*;
import com.swam.pricing.dto.PriceCalculationRequest;
import com.swam.shared.dto.PriceBreakdown;
import com.swam.shared.enums.GuestType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.swam.shared.exceptions.CityTaxRequiredException;

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

        long totalNights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());

        // calculate base amount night by night
        for (int i = 0; i < totalNights; i++) {
            LocalDate currentDate = request.getCheckIn().plusDays(i);

            int currentNightIndex = i;

            // count active guests for the night
            long activeAdults = request.getGuests().stream()
                    .filter(g -> g.getType() == GuestType.ADULT && g.getDays() > currentNightIndex)
                    .count();

            long activeChildren = request.getGuests().stream()
                    .filter(g -> g.getType() == GuestType.CHILD && g.getDays() > currentNightIndex)
                    .count();

            long activeInfants = request.getGuests().stream()
                    .filter(g -> g.getType() == GuestType.INFANT && g.getDays() > currentNightIndex)
                    .count();

            // season lookup
            Season activeSeason = relevantSeasons.stream()
                    .filter(s -> !currentDate.isBefore(s.getStartDate()) && !currentDate.isAfter(s.getEndDate()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Nessuna tariffa definita per il " + currentDate));

            SeasonalRate rate = rateRepository.findBySeasonIdAndResourceId(activeSeason.getId(), request.getResourceId())
                    .orElseThrow(() -> new RuntimeException("Prezzo mancante per risorsa " + request.getResourceId()));

            // calculate nightly cost for active guests
            BigDecimal nightlyCost = rate.getBasePrice();

            if (rate.getAdultPrice() != null) {
                nightlyCost = nightlyCost.add(rate.getAdultPrice().multiply(BigDecimal.valueOf(activeAdults)));
            }
            if (rate.getChildPrice() != null) {
                nightlyCost = nightlyCost.add(rate.getChildPrice().multiply(BigDecimal.valueOf(activeChildren)));
            }
            if (rate.getInfantPrice() != null && activeInfants > 0) {
                nightlyCost = nightlyCost.add(rate.getInfantPrice().multiply(BigDecimal.valueOf(activeInfants)));
            }

            baseAmount = baseAmount.add(nightlyCost);
        }

        // calculate city tax
        BigDecimal taxAmount = calculateCityTax(request);

        // calculate extras
        BigDecimal extrasTotal = BigDecimal.ZERO;
        if (request.getExtras() != null) {
            for (PriceCalculationRequest.BillableExtraItem item : request.getExtras()) {
                if (item.getUnitPrice() != null && item.getQuantity() > 0) {
                    BigDecimal itemCost = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    extrasTotal = extrasTotal.add(itemCost);
                }
            }
        }

        BigDecimal discount = request.getManualDiscount() != null ? request.getManualDiscount() : BigDecimal.ZERO;
        BigDecimal deposit = request.getDepositAmount() != null ? request.getDepositAmount() : BigDecimal.ZERO;

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
                .build();
    }

    private BigDecimal calculateCityTax(PriceCalculationRequest req) {
        CityTaxRule rule = taxRepository.findAll().stream().findFirst().orElse(null);

        if (rule == null || !rule.isEnabled()) {
            throw new com.swam.shared.exceptions.CityTaxRequiredException();
        }

        BigDecimal totalTax = BigDecimal.ZERO;
        int globalCap = rule.getMaxNightsCap();

        for (PriceCalculationRequest.GuestProfile guest : req.getGuests()) {

            if (guest.isTaxExempt()) {
                continue;
            }

            // check days of stay
            if (guest.getDays() <= 0) {
                continue;
            }

            // calculate chargeable nights for this guest
            int chargeableNights = Math.min(guest.getDays(), globalCap);

            // calculate rate based on guest type
            BigDecimal rate = BigDecimal.ZERO;

            if (guest.getType() == GuestType.ADULT) rate = rule.getAmountPerAdult();
            else if (guest.getType() == GuestType.CHILD) rate = rule.getAmountPerChild();
            else if (guest.getType() == GuestType.INFANT) rate = rule.getAmountPerInfant();

            if (rate != null && rate.compareTo(BigDecimal.ZERO) > 0) {
                totalTax = totalTax.add(rate.multiply(BigDecimal.valueOf(chargeableNights)));
            }
        }

        return totalTax;
    }
}