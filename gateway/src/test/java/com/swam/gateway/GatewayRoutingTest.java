package com.swam.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.test.web.reactive.server.WebTestClient;

// Import statici fondamentali per usare WireMock senza scrivere "WireMock." ogni volta
import static com.github.tomakehurst.wiremock.client.WireMock.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                // TRUCCO FONDAMENTALE:
                // Sovrascriviamo le variabili del file application.yml.
                // Diciamo al Gateway: "Non cercare i servizi su localhost:8081,
                // ma cercali sulla porta magica che WireMock aprirà per questo test".
                "RESOURCE_URI=http://localhost:${wiremock.server.port}",
                "PRICING_URI=http://localhost:${wiremock.server.port}",
                "BOOKING_URI=http://localhost:${wiremock.server.port}"
        }
)
@AutoConfigureWireMock(port = 0) // "port = 0" significa: Scegli una porta libera a caso
@AutoConfigureWebTestClient      // Ci dà il "finto browser" per chiamare il Gateway
class GatewayRoutingTest {

    @Autowired
    private WebTestClient webClient; // Questo è il client che useremo per "bussare" al Gateway

    /**
     * TEST 1: Resource Service Routing
     * Obiettivo: Verificare che se chiamo il Gateway su /api/resources,
     * lui giri la chiamata al servizio Resource (simulato da WireMock).
     */
    @Test
    void testResourceServiceRoute() {
        // 1. PREPARAZIONE (STUBBING) - Simile al "when(...).thenReturn(...)" di Mockito
        // Diciamo a WireMock: "Fingi di essere il Resource Service.
        // Se ti arriva una GET su /api/resources/123, rispondi OK con questo JSON".
        stubFor(get(urlEqualTo("/api/resources/123"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"id\": \"123\", \"name\": \"Bungalow Deluxe\"}")));

        // 2. ESECUZIONE & VERIFICA
        // Chiamiamo il Gateway (non WireMock direttamente!)
        webClient.get().uri("/api/resources/123")
                .exchange() // Esegui la chiamata
                .expectStatus().isOk() // Mi aspetto 200 OK dal Gateway
                .expectBody()
                .jsonPath("$.name").isEqualTo("Bungalow Deluxe"); // Verifico che il JSON sia arrivato intatto
    }

    /**
     * TEST 2: Pricing Service Routing
     */
    @Test
    void testPricingServiceRoute() {
        // 1. Istruiamo il finto Pricing Service
        stubFor(get(urlEqualTo("/api/pricing/calculate"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"finalPrice\": 150.00}")));

        // 2. Chiamiamo il Gateway
        webClient.get().uri("/api/pricing/calculate")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.finalPrice").isEqualTo(150.00);
    }

    /**
     * TEST 3: Booking Service Routing (POST request)
     * Testiamo anche una creazione (POST) per essere sicuri che passino i dati.
     */
    @Test
    void testBookingServiceRoute() {
        // 1. Istruiamo il finto Booking Service
        stubFor(post(urlEqualTo("/api/bookings"))
                .willReturn(aResponse()
                        .withStatus(201) // 201 Created
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"status\": \"CONFIRMED\"}")));

        // 2. Chiamiamo il Gateway inviando dati
        webClient.post().uri("/api/bookings")
                .bodyValue("{\"customer\": \"Mario Rossi\"}") // Inviamo un JSON al gateway
                .exchange()
                .expectStatus().isCreated() // Ci aspettiamo che il 201 torni indietro
                .expectBody()
                .jsonPath("$.status").isEqualTo("CONFIRMED");
    }
}
