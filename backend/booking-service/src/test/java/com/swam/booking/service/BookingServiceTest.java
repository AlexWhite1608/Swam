package com.swam.booking.service;

import com.swam.booking.client.PricingServiceClient;
import com.swam.booking.domain.*;
import com.swam.booking.dto.*;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private CustomerService customerService;
    @Mock private ExtraOptionService extraOptionService;
    @Mock private PricingServiceClient pricingClient;

    @InjectMocks
    private BookingService bookingService;

    @Test
    @DisplayName("CreateBooking: deve passare l'acconto al Pricing Service")
    void testCreateBooking_PassesDepositToPricing() {
        // SETUP
        CreateBookingRequest req = new CreateBookingRequest();
        req.setResourceId("ROOM-101");
        req.setCheckIn(LocalDate.now().plusDays(1));
        req.setCheckOut(LocalDate.now().plusDays(2));
        req.setGuestFirstName("Mario");
        req.setGuestLastName("Rossi");
        req.setGuestEmail("mario@test.com");
        req.setDepositAmount(new BigDecimal("50.00"));

        // Mock Customer
        when(customerService.registerOrUpdateCustomer(any())).thenReturn(CustomerResponse.builder()
                .id("cust-1")
                .firstName("Mario")
                .build());

        when(customerService.createGuestSnapshot(any())).thenReturn(Guest.builder().build());

        // Mock Risposta Pricing
        PriceBreakdown pricingResponse = PriceBreakdown.builder()
                .baseAmount(new BigDecimal("100.00"))
                .depositAmount(new BigDecimal("50.00"))
                .finalTotal(new BigDecimal("50.00"))
                .build();

        when(pricingClient.calculateQuote(any(PriceCalculationRequest.class)))
                .thenReturn(pricingResponse);

        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArguments()[0]);

        // ESECUZIONE
        BookingResponse response = bookingService.createBooking(req);

        // VERIFICA
        ArgumentCaptor<PriceCalculationRequest> captor = ArgumentCaptor.forClass(PriceCalculationRequest.class);
        verify(pricingClient).calculateQuote(captor.capture());

        assertEquals(new BigDecimal("50.00"), captor.getValue().getDepositAmount());
        assertEquals(new BigDecimal("50.00"), response.getPriceBreakdown().getFinalTotal());
    }

    @Test
    @DisplayName("CheckOut: deve inviare Extra e vecchio Acconto al Pricing Service")
    void testCheckOut_SendsExtrasAndPreservesDeposit() {
        String bookingId = "BKG-1";

        Guest mainGuest = Guest.builder().guestType(GuestType.ADULT).taxExempt(false).customerId("cust-1").build();
        Booking existingBooking = Booking.builder()
                .id(bookingId)
                .resourceId("ROOM-101")
                .checkIn(LocalDate.now().minusDays(2))
                .checkOut(LocalDate.now())
                .status(BookingStatus.CHECKED_IN)
                .mainGuest(mainGuest)
                .companions(new ArrayList<>())
                .priceBreakdown(PriceBreakdown.builder()
                        .depositAmount(new BigDecimal("50.00"))
                        .build())
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(existingBooking));

        CheckOutRequest req = new CheckOutRequest();
        req.setExtras(List.of(new CheckOutRequest.ConsumedExtra("EXTRA-1", 2)));

        ExtraOption beerOption = ExtraOption.builder()
                .id("EXTRA-1").name("Birra").defaultPrice(new BigDecimal("5.00")).build();
        when(extraOptionService.getExtraEntity("EXTRA-1")).thenReturn(beerOption);

        PriceBreakdown finalCalc = PriceBreakdown.builder()
                .baseAmount(new BigDecimal("200.00"))
                .extrasAmount(new BigDecimal("10.00"))
                .depositAmount(new BigDecimal("50.00"))
                .finalTotal(new BigDecimal("160.00"))
                .build();

        when(pricingClient.calculateQuote(any())).thenReturn(finalCalc);
        when(bookingRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        bookingService.checkOut(bookingId, req);

        ArgumentCaptor<PriceCalculationRequest> captor = ArgumentCaptor.forClass(PriceCalculationRequest.class);
        verify(pricingClient).calculateQuote(captor.capture());
        PriceCalculationRequest sentRequest = captor.getValue();

        assertEquals(new BigDecimal("50.00"), sentRequest.getDepositAmount());
        assertEquals(1, sentRequest.getExtras().size());
        assertEquals(new BigDecimal("5.00"), sentRequest.getExtras().get(0).getUnitPrice());
    }
}