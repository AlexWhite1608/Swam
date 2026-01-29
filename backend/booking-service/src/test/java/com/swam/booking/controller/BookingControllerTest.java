package com.swam.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swam.booking.dto.BookingResponse;
import com.swam.booking.dto.CheckInRequest;
import com.swam.booking.dto.CheckOutRequest;
import com.swam.booking.dto.CreateBookingRequest;
import com.swam.booking.service.BookingService;
import com.swam.shared.dto.PriceBreakdown;
import com.swam.shared.enums.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BookingController.class)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookingService bookingService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/bookings -> creates new booking")
    void createBooking_ShouldReturn201() throws Exception {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .resourceId("room-101")
                .checkIn(LocalDate.now().plusDays(1))
                .checkOut(LocalDate.now().plusDays(5))
                .guestFirstName("Mario")
                .guestLastName("Rossi")
                .guestEmail("mario@test.com")
                .guestPhone("+39123456789")
                .depositAmount(BigDecimal.valueOf(100.00))
                .build();

        PriceBreakdown initialPriceBreakdown = PriceBreakdown.builder()
                .baseAmount(BigDecimal.ZERO)
                .depositAmount(BigDecimal.valueOf(100.00))
                .taxAmount(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .extrasAmount(BigDecimal.ZERO)
                .finalTotal(BigDecimal.ZERO)
                .taxDescription(null)
                .build();

        BookingResponse response = BookingResponse.builder()
                .id("book-1")
                .resourceId("room-101")
                .status(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .priceBreakdown(initialPriceBreakdown)
                .createdAt(LocalDateTime.now())
                .build();

        when(bookingService.createBooking(any(CreateBookingRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("book-1"))
                .andExpect(jsonPath("$.status").value(BookingStatus.PENDING.toString()));

        verify(bookingService, times(1)).createBooking(any(CreateBookingRequest.class));
    }

    @Test
    @DisplayName("PATCH /api/bookings/{id}/confirm -> confirms booking")
    void confirmBooking_ShouldReturnConfirmed() throws Exception {
        BookingResponse response = BookingResponse.builder()
                .id("book-1")
                .status(BookingStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.DEPOSIT_PAID)
                .build();

        when(bookingService.confirmBooking("book-1", true)).thenReturn(response);

        mockMvc.perform(patch("/api/bookings/book-1/confirm")
                        .param("hasPaidDeposit", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(BookingStatus.CONFIRMED.toString()))
                .andExpect(jsonPath("$.paymentStatus").value(PaymentStatus.DEPOSIT_PAID.toString()));
    }

    @Test
    @DisplayName("POST /api/bookings/{id}/check-in -> check-in booking with full legal data")
    void checkIn_ShouldReturnCheckedIn() throws Exception {
        // Updated payload with all mandatory fields
        CheckInRequest request = CheckInRequest.builder()
                .firstName("Mario")
                .lastName("Rossi")
                .sex(Sex.M)
                .birthDate(LocalDate.of(1990, 1, 1))
                .placeOfBirth("Roma")
                .citizenship("IT")
                .email("mario@test.com")
                .phone("+393331234567")
                .documentType(DocumentType.ID_CARD)
                .documentNumber("AB12345")
                .guestType(GuestType.ADULT)
                .guestRole(GuestRole.HEAD_OF_FAMILY)
                .notes("Check-in test")
                .build();

        BookingResponse response = BookingResponse.builder()
                .id("book-1")
                .status(BookingStatus.CHECKED_IN)
                .build();

        when(bookingService.checkIn(eq("book-1"), any(CheckInRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/bookings/book-1/check-in")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(BookingStatus.CHECKED_IN.toString()));
    }

    @Test
    @DisplayName("POST /api/bookings/{id}/check-out -> check-out booking")
    void checkOut_WithoutExtras_ShouldSucceed() throws Exception {
        CheckOutRequest request = CheckOutRequest.builder()
                .extras(List.of())
                .build();

        BookingResponse response = BookingResponse.builder()
                .id("book-1")
                .status(BookingStatus.CHECKED_OUT)
                .extras(Collections.emptyList())
                .build();

        when(bookingService.checkOut(eq("book-1"), any(CheckOutRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/bookings/book-1/check-out")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.extras", hasSize(0)));
    }

    @Test
    @DisplayName("PUT /api/bookings/{id} -> updates booking basic info")
    void updateBooking_ShouldReturnUpdated() throws Exception {
        CreateBookingRequest updateRequest = CreateBookingRequest.builder()
                .resourceId("room-102")
                .checkIn(LocalDate.now().plusDays(2))
                .checkOut(LocalDate.now().plusDays(6))
                .guestFirstName("Mario")
                .guestLastName("Bianchi")
                .depositAmount(BigDecimal.valueOf(50.00))
                .build();

        BookingResponse response = BookingResponse.builder()
                .id("book-1")
                .resourceId("room-102") // Updated
                .status(BookingStatus.PENDING)
                .build();

        when(bookingService.updateBooking(eq("book-1"), any(CreateBookingRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/bookings/book-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resourceId").value("room-102"));
    }
}