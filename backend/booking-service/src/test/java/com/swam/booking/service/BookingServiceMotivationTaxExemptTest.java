package com.swam.booking.service;

import com.swam.booking.client.PricingServiceClient;
import com.swam.booking.domain.Booking;
import com.swam.booking.domain.Guest;
import com.swam.booking.dto.CheckOutRequest;
import com.swam.booking.dto.PriceCalculationRequest;
import com.swam.booking.repository.BookingRepository;
import com.swam.shared.dto.PriceBreakdown;
import com.swam.shared.enums.BookingStatus;
import com.swam.shared.enums.GuestType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceMotivationTaxExemptTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private PricingServiceClient pricingClient;
    @Mock private ExtraOptionService extraOptionService;
    @Mock private CustomerService customerService;

    @InjectMocks
    private BookingService bookingService;

    @Test
    @DisplayName("CheckOut: Verifica mappatura corretta della motivazione esenzione (taxExemptReason)")
    void checkOut_ShouldMapTaxExemptReasonToMotivation() {
        // --- 1. SETUP DATI ---
        String bookingId = "TEST-MOTIVATION-001";
        String motivazioneAttesa = "Residente nel Comune";

        Guest guestEsente = Guest.builder()
                .firstName("Mario").lastName("Rossi")
                .guestType(GuestType.ADULT)
                .taxExempt(true)
                .taxExemptReason(motivazioneAttesa)
                .build();

        Booking booking = Booking.builder()
                .id(bookingId)
                .resourceId("ROOM-101")
                .status(BookingStatus.CHECKED_IN)
                .checkIn(LocalDate.now().minusDays(2))
                .checkOut(LocalDate.now())
                .mainGuest(guestEsente)
                .companions(new ArrayList<>())
                .priceBreakdown(PriceBreakdown.builder().depositAmount(BigDecimal.ZERO).build())
                .build();

        // --- 2. MOCK ---
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArguments()[0]);
        when(pricingClient.calculateQuote(any())).thenReturn(PriceBreakdown.builder().finalTotal(BigDecimal.ZERO).build());

        // --- 3. AZIONE ---
        CheckOutRequest request = new CheckOutRequest();
        request.setExtras(new ArrayList<>());
        bookingService.checkOut(bookingId, request);

        // --- 4. VERIFICA (LA "SPIA") ---
        ArgumentCaptor<PriceCalculationRequest> captor = ArgumentCaptor.forClass(PriceCalculationRequest.class);
        verify(pricingClient).calculateQuote(captor.capture());

        PriceCalculationRequest requestCatturata = captor.getValue();
        PriceCalculationRequest.GuestProfile profiloInviato = requestCatturata.getGuests().get(0);

        // --- STAMPA DETTAGLIATA ---
        printVisualReport(motivazioneAttesa, profiloInviato);

        // --- ASSERTIONS ---
        assertTrue(profiloInviato.isTaxExempt(), "Il flag taxExempt deve essere true");
        assertEquals(motivazioneAttesa, profiloInviato.getTaxExemptMotivation(),
                "La motivazione dell'esenzione deve corrispondere esattamente a quella del DB");
    }

    private void printVisualReport(String expected, PriceCalculationRequest.GuestProfile actualProfile) {
        System.out.println("\n==================================================================");
        System.out.println("   REPORT TEST: TRASFERIMENTO MOTIVAZIONE ESENZIONE TASSA");
        System.out.println("==================================================================");
        System.out.println("1. FONTE DATI (Database Booking):");
        System.out.println("   [DB] Motivazione salvata : \"" + expected + "\"");
        System.out.println("------------------------------------------------------------------");
        System.out.println("2. DATI INVIATI (Request verso Pricing Service):");
        System.out.println("   [REQ] Flag Esenzione     : " + actualProfile.isTaxExempt());
        System.out.println("   [REQ] Motivazione Mappata: \"" + actualProfile.getTaxExemptMotivation() + "\"");
        System.out.println("------------------------------------------------------------------");

        if (expected.equals(actualProfile.getTaxExemptMotivation())) {
            System.out.println("   [✓] ESITO: SUCCESSO - La motivazione viaggia correttamente!");
        } else {
            System.out.println("   [X] ESITO: FALLITO - I dati non corrispondono.");
        }
        System.out.println("==================================================================\n");
    }
}