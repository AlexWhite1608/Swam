package com.swam.gateway;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.test.web.reactive.server.WebTestClient;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockJwt;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "RESOURCE_URI=http://localhost:${wiremock.server.port}",
                "PRICING_URI=http://localhost:${wiremock.server.port}",
                "BOOKING_URI=http://localhost:${wiremock.server.port}",
                "ISSUER_URI=http://localhost:9999/realms/test-realm",
                "JWK_SET_URI=http://localhost:9999/realms/test-realm/protocol/openid-connect/certs"
        }
)
@AutoConfigureWireMock(port = 0)
@AutoConfigureWebTestClient
class GatewayRoutingTest {

    @Autowired
    private WebTestClient webClient;

    @MockBean
    private ReactiveJwtDecoder jwtDecoder;

    // --- TEST 1: ROUTING BASE & SICUREZZA ---
    @Test
    @DisplayName("1. Resource Service: Routing OK con Token Valido")
    void testResourceServiceRoute() {
        printTestHeader("1. Resource Service Routing");

        // 1. Stubbing
        stubFor(get(urlEqualTo("/api/resources/123"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"id\": \"123\", \"name\": \"Bungalow Deluxe\"}")));

        // 2. Esecuzione
        webClient
                .mutateWith(mockJwt())
                .get().uri("/api/resources/123")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.name").isEqualTo("Bungalow Deluxe");

        printTestResult(true, "Routing effettuato e risposta ricevuta.");
    }

    // --- TEST 2: VERIFICA PROPAGAZIONE HEADER (KEYCLOAK -> GATEWAY -> MICROSERVIZIO) ---
    @Test
    @DisplayName("2. Security Filter: Verifica propagazione Header X-User-Id")
    void testUserHeaderPropagation() {
        printTestHeader("2. Verifica Propagazione Header (User ID & Email)");

        // Dati simulati nel Token JWT
        String userId = "user-uuid-555";
        String userEmail = "mario.rossi@test.com";

        // 1. Stubbing generico (basta che risponda OK)
        stubFor(post(urlEqualTo("/api/bookings"))
                .willReturn(aResponse().withStatus(201)));

        // 2. Chiamata con Token Customizzato
        webClient
                .mutateWith(mockJwt()
                        .jwt(jwt -> jwt
                                .claim("sub", userId)   // Keycloak usa "sub" come ID utente
                                .claim("email", userEmail)
                        ))
                .post().uri("/api/bookings")
                .bodyValue("{}")
                .exchange()
                .expectStatus().isCreated();

        // 3. VERIFICA PROFONDA: Controlliamo cosa è arrivato a WireMock
        // Se il filtro UserHeaderFilter funziona, WireMock deve aver ricevuto gli header extra.
        try {
            verify(postRequestedFor(urlEqualTo("/api/bookings"))
                    .withHeader("X-User-Id", equalTo(userId))
                    .withHeader("X-User-Email", equalTo(userEmail)));

            System.out.println("   [INFO] WireMock conferma: Gli header sono arrivati al backend!");
            printTestResult(true, "Header X-User-Id e X-User-Email propagati correttamente.");
        } catch (AssertionError e) {
            printTestResult(false, "Il Gateway NON ha inviato gli header utente.");
            throw e;
        }
    }

    // --- TEST 3: ACCESSO NEGATO ---
    @Test
    @DisplayName("3. Security: Blocco Accesso senza Token")
    void testUnauthorizedAccess() {
        printTestHeader("3. Test Accesso Non Autorizzato (No Token)");

        webClient
                // NESSUN MUTATE CON MOCKJWT QUI
                .get().uri("/api/resources/123")
                .exchange()
                .expectStatus().isUnauthorized(); // 401

        printTestResult(true, "Richiesta bloccata con 401 come previsto.");
    }

    @LocalServerPort
    private int port;
    // --- TEST 4: CORS (OPTIONS) ---
    @Test
    @DisplayName("4. CORS: Permesso alle richieste OPTIONS")
    void testCorsOptions() {
        printTestHeader("4. Test CORS (Preflight OPTIONS)");

        webClient.mutate()
                .baseUrl("http://localhost:" + port) // <--- FIX: Impostiamo il Base URL a livello di client
                .build()
                .options().uri("/api/resources") // Ora possiamo usare il path relativo
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "GET")
                .exchange()
                .expectStatus().isOk();

        printTestResult(true, "Richiesta OPTIONS accettata senza token.");
    }

    // --- HELPER PER OUTPUT LEGGIBILE ---
    private void printTestHeader(String testName) {
        System.out.println("\n------------------------------------------------------------");
        System.out.println("▶ TEST: " + testName);
        System.out.println("------------------------------------------------------------");
    }

    private void printTestResult(boolean success, String message) {
        if (success) {
            System.out.println("   [✓] SUCCESSO: " + message);
        } else {
            System.out.println("   [X] FALLITO: " + message);
        }
        System.out.println("------------------------------------------------------------\n");
    }
}