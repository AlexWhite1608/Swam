package com.swam.booking.service;

import com.swam.booking.domain.Booking;
import com.swam.booking.domain.Customer;
import com.swam.booking.domain.ExtraOption;
import com.swam.booking.domain.Guest;
import com.swam.booking.dto.*;
import com.swam.booking.repository.BookingRepository;
import com.swam.shared.dto.PriceBreakdown;
import com.swam.shared.enums.*;
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
                .build();

        Booking savedBooking = Booking.builder()
                .id("book-1")
                .status(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .mainGuest(mockGuest)
                .priceBreakdown(initialPriceBreakdown)
                .build();

        when(bookingRepository.findOverlaps(anyString(), any(), any())).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        BookingResponse response = bookingService.createBooking(request);

        assertNotNull(response);
        assertEquals(BookingStatus.PENDING, response.getStatus());
        assertEquals(new BigDecimal("50.00"), response.getPriceBreakdown().getDepositAmount());

        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("Check: Should check-in, update Main Customer AND register Companions")
    void checkIn_ShouldHandleMainGuestAndCompanions() {
        String bookingId = "book-1";

        // Setup Request con Main Guest e Companion
        CheckInRequest request = CheckInRequest.builder()
                // Main Guest
                .firstName("Mario")
                .lastName("Rossi")
                .sex(Sex.M)
                .birthDate(LocalDate.of(1980, 1, 1))
                .documentType(DocumentType.ID_CARD)
                .documentNumber("DOC1")
                .guestRole(GuestRole.HEAD_OF_FAMILY)
                .guestType(GuestType.ADULT)
                .email("mario@test.com")
                // Companion
                .companions(List.of(
                        CheckInRequest.CompanionData.builder()
                                .firstName("Luigi")
                                .lastName("Rossi")
                                .sex(Sex.M)
                                .birthDate(LocalDate.of(2010, 1, 1))
                                .guestRole(GuestRole.MEMBER)
                                .guestType(GuestType.CHILD)
                                .build()
                ))
                .build();

        Booking confirmedBooking = Booking.builder()
                .id(bookingId)
                .status(BookingStatus.CONFIRMED)
                .checkIn(LocalDate.now())
                .mainGuest(Guest.builder().customerId("cust-1").build()) // existing partial guest
                .priceBreakdown(PriceBreakdown.builder().build())
                .build();

        // Mocks for Main Guest
        CustomerResponse mainGuestResponse = CustomerResponse.builder().id("cust-1").firstName("Mario").build();
        Guest mainSnapshot = Guest.builder().firstName("Mario").guestRole(GuestRole.HEAD_OF_FAMILY).build();

        // Mocks for Companion
        CustomerResponse companionResponse = CustomerResponse.builder().id("cust-2").firstName("Luigi").build();
        Guest compSnapshot = Guest.builder().firstName("Luigi").guestRole(GuestRole.MEMBER).build();

        // 1. Retrieve Booking
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(confirmedBooking));

        // 2. Register/Update Main Customer
        when(customerService.registerOrUpdateCustomer(any(CreateCustomerRequest.class))).thenReturn(mainGuestResponse);
        when(customerService.createGuestSnapshot(mainGuestResponse, GuestRole.HEAD_OF_FAMILY)).thenReturn(mainSnapshot);

        // 3. Register/Update Companion
        when(customerService.registerOrUpdateCompanion(any(CheckInRequest.CompanionData.class))).thenReturn(companionResponse);
        when(customerService.createGuestSnapshot(companionResponse, GuestRole.MEMBER)).thenReturn(compSnapshot);

        // 4. Save Booking (return the modified object)
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        // Execution
        BookingResponse response = bookingService.checkIn(bookingId, request);

        // Assertions
        assertEquals(BookingStatus.CHECKED_IN, response.getStatus());

        // Verify Main Guest
        assertEquals("Mario", response.getMainGuest().getFirstName());

        // Verify Companion
        assertNotNull(response.getCompanions());
        assertEquals(1, response.getCompanions().size());
        assertEquals("Luigi", response.getCompanions().get(0).getFirstName());
        assertEquals(GuestRole.MEMBER, response.getCompanions().get(0).getGuestRole());

        // Verify Interactions
        verify(customerService).registerOrUpdateCustomer(any());
        verify(customerService).registerOrUpdateCompanion(any());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    @DisplayName("Check: Should throw exception when checking in with invalid status")
    void checkIn_ShouldThrowException_WhenStatusIsInvalid() {
        Booking cancelledBooking = Booking.builder().id("book-1").status(BookingStatus.CANCELLED).build();
        when(bookingRepository.findById("book-1")).thenReturn(Optional.of(cancelledBooking));

        assertThrows(InvalidBookingDateException.class,
                () -> bookingService.checkIn("book-1", new CheckInRequest()));
    }
}