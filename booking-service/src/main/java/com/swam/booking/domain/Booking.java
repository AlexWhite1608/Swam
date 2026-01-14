package com.swam.booking.domain;

import com.swam.shared.dto.PriceBreakdown;
import com.swam.shared.enums.BookingStatus;
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

    @NotNull
    private String resourceId;

    @NotNull(message = "Il capogruppo è obbligatorio")
    @Valid
    private Guest mainGuest;

    @Valid
    @Builder.Default
    private List<Guest> companions = new ArrayList<>();

    @NotNull(message = "La data di check-in è obbligatoria")
    @FutureOrPresent(message = "La data del check-in deve essere valida")
    private LocalDate checkIn;

    @NotNull(message = "La data di check-out è obbligatoria")
    @Future(message = "La data di check-out deve essere valida")
    private LocalDate checkOut;

    @Valid
    @Builder.Default
    private List<BookingExtra> extras = new ArrayList<>();

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    // snapshot of price breakdown at the time of booking to avoid issues if pricing rules change later
    private PriceBreakdown priceBreakdown;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public void confirm() {
        this.status = BookingStatus.CONFIRMED;
    }

    public void cancel() {
        this.status = BookingStatus.CANCELLED;
    }

    public void checkIn() {
        this.status = BookingStatus.CHECKED_IN;
    }

    public void checkOut() {
        this.status = BookingStatus.CHECKED_OUT;
    }

    public void addCompanion(@Valid Guest guest) {
        if (this.companions == null) {
            this.companions = new ArrayList<>();
        }
        this.companions.add(guest);
    }

    public void removeCompanion(String guestId) {
        if (this.companions != null) {
            this.companions.removeIf(g -> Objects.equals(g.getId(), guestId));
        }
    }

    public void editCompanion(String guestId, @NotNull Guest updatedGuest) {
        if (this.companions != null) {
            for (int i = 0; i < this.companions.size(); i++) {
                if (this.companions.get(i).getId().equals(guestId)) {
                    this.companions.set(i, updatedGuest);
                    break;
                }
            }
        }
    }

    public void addExtra(@Valid BookingExtra extra) {
        if (this.extras == null) {
            this.extras = new ArrayList<>();
        }
        this.extras.add(extra);
    }

    public void removeExtra(String extraOptionId) {
        if (this.extras != null) {
            this.extras.removeIf(e -> Objects.equals(e.getExtraOptionId(), extraOptionId));
        }
    }

}