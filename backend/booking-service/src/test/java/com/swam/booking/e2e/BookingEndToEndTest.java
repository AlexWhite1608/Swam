package com.swam.booking.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swam.booking.domain.ExtraOption;
import com.swam.booking.dto.*;
import com.swam.booking.repository.BookingRepository;
import com.swam.booking.repository.CustomerRepository;
import com.swam.booking.repository.ExtraOptionRepository;
import com.swam.shared.enums.BookingStatus;
import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.ExtraCategory;
import com.swam.shared.enums.GuestType;
import com.swam.shared.enums.PaymentStatus;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

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

    private String savedExtraId;

    @BeforeEach
    void setup() {
        bookingRepository.deleteAll();
        customerRepository.deleteAll();
        extraOptionRepository.deleteAll();

        // setup: create and save an extra option to be used during check-out
        ExtraOption breakfast = ExtraOption.builder()
                .name("Colazione Continental")
                .description("Buffet")
                .defaultPrice(new BigDecimal("15.00"))
                .category(ExtraCategory.FOOD_BEVERAGE)
                .isActive(true)
                .build();
        savedExtraId = extraOptionRepository.save(breakfast).getId();
    }

    @Test
    @DisplayName("E2E: Full Booking Lifecycle (Create -> Confirm -> CheckIn -> CheckOut)")
    void bookingFullLifecycleTest() throws Exception {

        CreateBookingRequest createRequest = CreateBookingRequest.builder()
                .resourceId("room-101")
                .checkIn(LocalDate.now())
                .checkOut(LocalDate.now().plusDays(15))
                .guestFirstName("Mario")
                .guestLastName("Rossi")
                .guestEmail("mario.test@example.com")
                .depositAmount(new BigDecimal("50.00"))
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(BookingStatus.PENDING.toString()))
                .andExpect(jsonPath("$.paymentStatus").value(PaymentStatus.UNPAID.toString()))
                .andExpect(jsonPath("$.priceBreakdown.depositAmount").value(50.00))
                .andReturn();

        // extract booking ID from creation response
        String bookingId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

        // confirms booking with deposit paid
        mockMvc.perform(patch("/api/bookings/{id}/confirm", bookingId)
                        .param("hasPaidDeposit", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(BookingStatus.CONFIRMED.toString()))
                .andExpect(jsonPath("$.paymentStatus").value(PaymentStatus.DEPOSIT_PAID.toString()));


        // check-in with main guest details and a companion
        CheckInRequest checkInRequest = CheckInRequest.builder()
                .phone("+393331234567")
                .address("Via Roma 1, Milano")
                .birthDate(LocalDate.of(1985, 5, 20))
                .documentType(DocumentType.PASSPORT)
                .documentNumber("PASS-12345")
                .guestType(GuestType.ADULT)
                .country("Italy")
                .companions(List.of(
                        CheckInRequest.CompanionData.builder()
                                .firstName("Lucia")
                                .lastName("Bianchi")
                                .birthDate(LocalDate.of(1990, 10, 10))
                                .guestType(GuestType.ADULT)
                                .build()
                ))
                .build();

        mockMvc.perform(post("/api/bookings/{id}/check-in", bookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkInRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(BookingStatus.CHECKED_IN.toString()))
                // check main guest details
                .andExpect(jsonPath("$.mainGuest.documentNumber").value("PASS-12345"))
                .andExpect(jsonPath("$.mainGuest.phone").value("+393331234567"))
                // check companion details
                .andExpect(jsonPath("$.companions", hasSize(1)))
                .andExpect(jsonPath("$.companions[0].firstName").value("Lucia"));


        // check-out with consumed extras
        CheckOutRequest checkOutRequest = CheckOutRequest.builder()
                .extras(List.of(
                        new CheckOutRequest.ConsumedExtra(savedExtraId, 2)
                ))
                .build();

        mockMvc.perform(post("/api/bookings/{id}/check-out", bookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkOutRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(BookingStatus.CHECKED_OUT.toString()))
                // check consumed extras
                .andExpect(jsonPath("$.extras", hasSize(1)))
                .andExpect(jsonPath("$.extras[0].nameSnapshot").value("Colazione Continental"))
                .andExpect(jsonPath("$.extras[0].quantity").value(2));
    }
}