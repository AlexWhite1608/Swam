package com.swam.gateway;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.test.web.reactive.server.WebTestClient;
import static com.github.tomakehurst.wiremock.client.WireMock.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "RESOURCE_URI=http://localhost:${wiremock.server.port}",
                "PRICING_URI=http://localhost:${wiremock.server.port}",
                "BOOKING_URI=http://localhost:${wiremock.server.port}"
        }
)
@AutoConfigureWireMock(port = 0)
@AutoConfigureWebTestClient
class GatewayRoutingTest {

    @Autowired
    private WebTestClient webClient;

    @Test
    @DisplayName("Test Resource Service Routing through Gateway")
    void testResourceServiceRoute() {
        stubFor(get(urlEqualTo("/api/resources/123"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"id\": \"123\", \"name\": \"Bungalow Deluxe\"}")));

        webClient.get().uri("/api/resources/123")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.name").isEqualTo("Bungalow Deluxe");
    }

    //TODO: Aggiungere un test per il Pricing Service
    @Test
    @DisplayName("Test Pricing Service Routing through Gateway")
    void testPricingServiceRoute() {
        stubFor(get(urlEqualTo("/api/pricing/calculate"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"finalPrice\": 150.00}")));

        webClient.get().uri("/api/pricing/calculate")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.finalPrice").isEqualTo(150.00);
    }

    @Test
    @DisplayName("Test Booking Service Routing through Gateway")
    void testBookingServiceRoute() {
        stubFor(post(urlEqualTo("/api/bookings"))
                .willReturn(aResponse()
                        .withStatus(201)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"status\": \"CONFIRMED\"}")));

        webClient.post().uri("/api/bookings")
                .bodyValue("{\"customer\": \"Mario Rossi\"}")
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.status").isEqualTo("CONFIRMED");
    }
}
