package com.swam.booking.service;

import com.swam.booking.domain.Booking;
import com.swam.booking.domain.Customer;
import com.swam.booking.domain.ExtraOption;
import com.swam.booking.domain.Guest;
import com.swam.booking.dto.*;
import com.swam.booking.repository.BookingRepository;
import com.swam.shared.dto.PriceBreakdown;
import com.swam.shared.enums.BookingStatus;
import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestType;
import com.swam.shared.enums.PaymentStatus;
import com.swam.shared.exceptions.InvalidBookingDateException;
import com.swam.shared.exceptions.SlotNotAvailableException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private CustomerService customerService;

    @Mock
    private ExtraOptionService extraOptionService;

    @InjectMocks
    private BookingService bookingService;

    @Test
    @DisplayName("Check: Should create pending booking when data is valid")
    void createBooking_ShouldCreatePendingBooking_WhenDataIsValid() {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .resourceId("res-1")
                .checkIn(LocalDate.now().plusDays(10))
                .checkOut(LocalDate.now().plusDays(15))
                .guestFirstName("Mario")
                .guestLastName("Rossi")
                .guestEmail("mario@test.com")
                .depositAmount(new BigDecimal("50.00"))
                .build();

        Guest mockGuest = Guest.builder().firstName("Mario").lastName("Rossi").build();
        PriceBreakdown initialPriceBreakdown = PriceBreakdown.builder()
                .baseAmount(BigDecimal.ZERO)
                .depositAmount(new BigDecimal("50.00"))
                .taxAmount(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .extrasAmount(BigDecimal.ZERO)
                .finalTotal(BigDecimal.ZERO)
                .taxDescription(null)
                .build();

        Booking savedBooking = Booking.builder()
                .id("book-1")
                .status(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .mainGuest(mockGuest)
                .priceBreakdown(initialPriceBreakdown)
                .build();

        when(bookingRepository.findOverlaps(anyString(), any(), any())).thenReturn(Collections.emptyList());
        when(customerService.registerOrUpdateCustomer(any())).thenReturn(CustomerResponse.builder().id("cust-1").build());
        when(customerService.createGuestSnapshot(any())).thenReturn(mockGuest);
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        BookingResponse response = bookingService.createBooking(request);

        assertNotNull(response);
        assertEquals(BookingStatus.PENDING, response.getStatus());
        assertEquals(PaymentStatus.UNPAID, response.getPaymentStatus());

        // check price breakdown
        PriceBreakdown breakdown = response.getPriceBreakdown();
        assertNotNull(breakdown);
        assertEquals(BigDecimal.ZERO, breakdown.getBaseAmount());
        assertEquals(new BigDecimal("50.00"), breakdown.getDepositAmount());
        assertEquals(BigDecimal.ZERO, breakdown.getTaxAmount());
        assertEquals(BigDecimal.ZERO, breakdown.getDiscountAmount());
        assertEquals(BigDecimal.ZERO, breakdown.getExtrasAmount());
        assertEquals(BigDecimal.ZERO, breakdown.getFinalTotal());
        assertNull(breakdown.getTaxDescription());

        assertTrue(response.getCompanions() == null || response.getCompanions().isEmpty());
        assertTrue(response.getExtras() == null || response.getExtras().isEmpty());


        verify(customerService, times(1)).registerOrUpdateCustomer(any());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("Check: Should throw exception when booking dates are invalid")
    void createBooking_ShouldThrowException_WhenDatesAreInvalid() {
        // check out before check in
        CreateBookingRequest request = CreateBookingRequest.builder()
                .resourceId("res-1")
                .checkIn(LocalDate.now().plusDays(10))
                .checkOut(LocalDate.now().plusDays(5))
                .build();

        assertThrows(InvalidBookingDateException.class, () -> bookingService.createBooking(request));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Check: Should throw exception when slot is not available (overlap)")
    void createBooking_ShouldThrowException_WhenSlotIsNotAvailable() {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .resourceId("res-1")
                .checkIn(LocalDate.now().plusDays(10))
                .checkOut(LocalDate.now().plusDays(15))
                .build();

        // simulates overlapping bookings
        when(bookingRepository.findOverlaps(anyString(), any(), any()))
                .thenReturn(List.of(new Booking()));

        assertThrows(SlotNotAvailableException.class, () -> bookingService.createBooking(request));
    }

    @Test
    @DisplayName("Check: Should confirm booking when status is pending")
    void confirmBooking_ShouldUpdateStatus_WhenStatusIsPending() {
        Booking pendingBooking = Booking.builder().id("book-1").status(BookingStatus.PENDING).build();
        Booking confirmedBooking = Booking.builder().id("book-1").status(BookingStatus.CONFIRMED).build();

        when(bookingRepository.findById("book-1")).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(confirmedBooking);

        BookingResponse response = bookingService.confirmBooking("book-1", false);

        assertEquals(BookingStatus.CONFIRMED, response.getStatus());
    }

    @Test
    @DisplayName("Check: Should throw exception when confirming booking with invalid status")
    void confirmBooking_ShouldThrowException_WhenStatusIsNotPending() {
        Booking cancelledBooking = Booking.builder().id("book-1").status(BookingStatus.CANCELLED).build();
        when(bookingRepository.findById("book-1")).thenReturn(Optional.of(cancelledBooking));

        assertThrows(IllegalStateException.class, () -> bookingService.confirmBooking("book-1", false));
    }

    @Test
    @DisplayName("Check: Should check-in and update customer when data is valid")
    void checkIn_ShouldUpdateCustomerAndStatus_WhenDataIsValid() {
        String bookingId = "book-1";

        CheckInRequest request = CheckInRequest.builder()
                .documentType(DocumentType.PASSPORT)
                .documentNumber("AB12345")
                .country("Italy")
                .phone("+3332952197")
                .address("Via Roma")
                .birthDate(LocalDate.of(1990, 1, 1))
                .guestType(GuestType.ADULT)
                .build();

        PriceBreakdown emptyPrice = PriceBreakdown.builder()
                .depositAmount(BigDecimal.ZERO)
                .build();

        Guest initialGuest = Guest.builder().customerId("cust-1").build();
        Booking confirmedBooking = Booking.builder()
                .id(bookingId)
                .status(BookingStatus.CONFIRMED)
                .checkIn(LocalDate.now())
                .mainGuest(initialGuest)
                .priceBreakdown(emptyPrice)
                .build();

        Customer existingCustomer = Customer.builder().id("cust-1").firstName("Mario").build();
        CustomerResponse updatedCustomerResponse = CustomerResponse.builder().id("cust-1").build();
        Guest updatedGuestSnapshot = Guest.builder().documentNumber("AB12345").build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(confirmedBooking));
        when(customerService.getCustomerEntityOrThrow("cust-1")).thenReturn(existingCustomer);
        when(customerService.registerOrUpdateCustomer(any())).thenReturn(updatedCustomerResponse);
        when(customerService.createGuestSnapshot(any())).thenReturn(updatedGuestSnapshot);

        Booking savedBooking = Booking.builder()
                .id(bookingId)
                .status(BookingStatus.CHECKED_IN)
                .checkIn(LocalDate.now())
                .mainGuest(updatedGuestSnapshot)
                .priceBreakdown(emptyPrice)
                .build();

        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        BookingResponse response = bookingService.checkIn(bookingId, request);

        assertEquals(BookingStatus.CHECKED_IN, response.getStatus());
        verify(customerService).registerOrUpdateCustomer(any());

        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    @DisplayName("Check: Should check-out, add extras and close booking when status is checked-in")
    void checkOut_ShouldAddExtrasAndCloseBooking_WhenStatusIsCheckedIn() {
        String bookingId = "book-1";
        CheckOutRequest request = CheckOutRequest.builder()
                .extras(List.of(new CheckOutRequest.ConsumedExtra("extra-1", 2)))
                .build();

        PriceBreakdown initialPrice = PriceBreakdown.builder().depositAmount(BigDecimal.ZERO).build();
        Booking checkedInBooking = Booking.builder()
                .id(bookingId)
                .status(BookingStatus.CHECKED_IN)
                .priceBreakdown(initialPrice)
                .build();

        ExtraOption mockExtra = ExtraOption.builder()
                .id("extra-1")
                .name("Cena")
                .defaultPrice(new BigDecimal("20.00"))
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(checkedInBooking));
        when(extraOptionService.getExtraEntity("extra-1")).thenReturn(mockExtra);

        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.checkOut(bookingId, request);

        assertEquals(BookingStatus.CHECKED_OUT, response.getStatus());
        assertEquals(1, response.getExtras().size());
        assertEquals("Cena", response.getExtras().get(0).getNameSnapshot());
        //assertEquals(new BigDecimal("40.00"), response.getPriceBreakdown().getExtrasAmount()); // TODO: gestione pagamenti
    }

    @Test
    @DisplayName("Check: Should throw exception when checking out with invalid status")
    void checkOut_ShouldThrowException_WhenStatusIsNotCheckedIn() {
        Booking confirmedBooking = Booking.builder().id("book-1").status(BookingStatus.CONFIRMED).build();
        when(bookingRepository.findById("book-1")).thenReturn(Optional.of(confirmedBooking));

        assertThrows(InvalidBookingDateException.class,
                () -> bookingService.checkOut("book-1", new CheckOutRequest()));
    }
}