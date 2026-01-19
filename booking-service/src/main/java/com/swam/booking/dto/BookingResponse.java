package com.swam.booking.dto;

import com.swam.booking.domain.BookingExtra;
import com.swam.booking.domain.Guest;
import com.swam.shared.dto.PriceBreakdown;
import com.swam.shared.enums.BookingStatus;
import com.swam.shared.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class BookingResponse {
    private String id;
    private String resourceId;
    private LocalDate checkIn;
    private LocalDate checkOut;

    private BookingStatus status;
    private PaymentStatus paymentStatus;

    private Guest mainGuest;

    @Builder.Default
    private List<Guest> companions;

    @Builder.Default
    private List<BookingExtra> extras;

    private PriceBreakdown priceBreakdown;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
