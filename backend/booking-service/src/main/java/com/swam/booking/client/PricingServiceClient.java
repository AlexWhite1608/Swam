package com.swam.booking.client;

import com.swam.booking.dto.PriceCalculationRequest;
import com.swam.shared.dto.PriceBreakdown;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// "url" prende l'indirizzo dalla configurazione
@FeignClient(name = "pricing-service", url = "${PRICING_URI:http://localhost:8082}")
public interface PricingServiceClient {

    @PostMapping("/api/pricing/calculate")
    PriceBreakdown calculateQuote(@RequestBody PriceCalculationRequest request);
}