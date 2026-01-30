package com.swam.booking.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swam.booking.dto.*;
import com.swam.booking.repository.BookingRepository;
import com.swam.booking.repository.CustomerRepository;
import com.swam.booking.repository.ExtraOptionRepository;
import com.swam.shared.enums.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BookingEndToEndTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private ExtraOptionRepository extraOptionRepository;

    @BeforeEach
    void setup() {
        bookingRepository.deleteAll();
        customerRepository.deleteAll();
        extraOptionRepository.deleteAll();
    }

    @Test
    @DisplayName("E2E: Full Booking Lifecycle with CheckIn and Companions")
    void bookingFullLifecycleTest() throws Exception {

        // 1. CREATE BOOKING (Minimal Info)
        CreateBookingRequest createRequest = CreateBookingRequest.builder()
                .resourceId("room-101")
                .checkIn(LocalDate.now())
                .checkOut(LocalDate.now().plusDays(5))
                .guestFirstName("Mario")
                .guestLastName("Rossi")
                .guestEmail("mario.test@example.com")
                .depositAmount(new BigDecimal("50.00"))
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String bookingId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        // 2. CONFIRM BOOKING
        mockMvc.perform(patch("/api/bookings/{id}/confirm", bookingId)
                        .param("hasPaidDeposit", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(BookingStatus.CONFIRMED.toString()));

        // 3. CHECK-IN (With FULL LEGAL DATA - Mandatory fields included)
        CheckInRequest checkInRequest = CheckInRequest.builder()
                // Dati Main Guest
                .firstName("Mario")
                .lastName("Rossi")
                .sex(Sex.M) // Mandatory
                .birthDate(LocalDate.of(1985, 5, 20)) // Mandatory
                .placeOfBirth("Roma")
                .citizenship("IT")
                .email("mario.test@example.com")
                .phone("+393331234567")
                .documentType(DocumentType.PASSPORT)
                .documentNumber("PASS-12345")
                .guestType(GuestType.ADULT)
                .guestRole(GuestRole.HEAD_OF_FAMILY) // Mandatory Role

                // Dati Companion
                .companions(List.of(
                        CheckInRequest.CompanionData.builder()
                                .firstName("Lucia")
                                .lastName("Bianchi")
                                .sex(Sex.F) // Mandatory
                                .birthDate(LocalDate.of(1990, 10, 10)) // Mandatory
                                .placeOfBirth("Napoli")
                                .citizenship("IT")
                                .guestType(GuestType.ADULT)
                                .guestRole(GuestRole.MEMBER) // Mandatory Role
                                .build()
                ))
                .build();

        mockMvc.perform(post("/api/bookings/{id}/check-in", bookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkInRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(BookingStatus.CHECKED_IN.toString()))
                // Verify Main Guest Snapshot
                .andExpect(jsonPath("$.mainGuest.sex").value("M"))
                .andExpect(jsonPath("$.mainGuest.guestRole").value("HEAD_OF_FAMILY"))
                // Verify Companion Snapshot
                .andExpect(jsonPath("$.companions", hasSize(1)))
                .andExpect(jsonPath("$.companions[0].firstName").value("Lucia"))
                .andExpect(jsonPath("$.companions[0].sex").value("F"))
                .andExpect(jsonPath("$.companions[0].guestRole").value("MEMBER"));
    }
}