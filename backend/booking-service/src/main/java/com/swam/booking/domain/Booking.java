package com.swam.booking.domain;

import com.swam.shared.dto.PriceBreakdown;
import com.swam.shared.enums.BookingStatus;
import com.swam.shared.enums.PaymentStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    @Indexed
    private String groupId;

    // refers to previusly booking fragment in case of split bookings
    private String parentBookingId;

    @NotNull
    private String resourceId;

    @Valid
    private Guest mainGuest;

    @FutureOrPresent(message = "La data del check-in deve essere valida")
    private LocalDate checkIn;

    @Future(message = "La data di check-out deve essere valida")
    private LocalDate checkOut;

    @Valid
    @Builder.Default
    private List<Guest> companions = new ArrayList<>();

    @Valid
    @Builder.Default
    private List<BookingExtra> extras = new ArrayList<>();

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    // snapshot of price breakdown at the time of booking to avoid issues if pricing rules change later
    private PriceBreakdown priceBreakdown;

    private PaymentStatus paymentStatus;

    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}