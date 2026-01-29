package com.swam.booking.repository;

import com.swam.booking.domain.Booking;
import com.swam.booking.domain.Guest;
import com.swam.shared.enums.BookingStatus;
import com.swam.shared.enums.GuestRole;
import com.swam.shared.enums.GuestType;
import com.swam.shared.enums.Sex;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataMongoTest
@Testcontainers
class BookingRepositoryTest {

    @Container
    @ServiceConnection
    static MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:6.0");

    @Autowired
    private BookingRepository bookingRepository;

    @AfterEach
    void tearDown() {
        bookingRepository.deleteAll();
    }

    @Test
    @DisplayName("Check: findOverlaps detects conflicts correctly")
    void findOverlaps_ShouldDetectConflicts() {
        // existing booking
        String resId = "suite-royal";
        Booking existing = Booking.builder()
                .resourceId(resId)
                .checkIn(LocalDate.of(2025, 1, 10))
                .checkOut(LocalDate.of(2025, 1, 15))
                .status(BookingStatus.CONFIRMED)
                .mainGuest(createValidGuest()) // Guest valido
                .build();
        bookingRepository.save(existing);

        // existing arrives at 10 Jan, new leaves at 10 Jan -> NO CONFLICT
        List<Booking> before = bookingRepository.findOverlaps(resId,
                LocalDate.of(2025, 1, 1), LocalDate.of(2025, 1, 10));
        assertThat(before).isEmpty();

        // existing leaves at 15 Jan, new arrives at 15 Jan -> NO CONFLICT
        List<Booking> after = bookingRepository.findOverlaps(resId,
                LocalDate.of(2025, 1, 15), LocalDate.of(2025, 1, 20));
        assertThat(after).isEmpty();

        // exact conflict, matching the same dates -> CONFLICT
        List<Booking> exact = bookingRepository.findOverlaps(resId,
                LocalDate.of(2025, 1, 10), LocalDate.of(2025, 1, 15));
        assertThat(exact).hasSize(1);

        // overlap, new booking inside existing one -> CONFLICT
        List<Booking> partial = bookingRepository.findOverlaps(resId,
                LocalDate.of(2025, 1, 12), LocalDate.of(2025, 1, 18));
        assertThat(partial).hasSize(1);

        // new booking completely surrounding existing one -> CONFLICT
        List<Booking> engulfing = bookingRepository.findOverlaps(resId,
                LocalDate.of(2025, 1, 1), LocalDate.of(2025, 1, 30));
        assertThat(engulfing).hasSize(1);
    }

    @Test
    @DisplayName("Check: findOverlapsExcluding excludes specific booking ID")
    void findOverlapsExcluding_ShouldWorkCorrectly() {
        String resId = "suite-royal";
        String bookingId = "book-1";

        Booking existing = Booking.builder()
                .id(bookingId)
                .resourceId(resId)
                .checkIn(LocalDate.of(2025, 1, 10))
                .checkOut(LocalDate.of(2025, 1, 15))
                .status(BookingStatus.CONFIRMED)
                .mainGuest(createValidGuest())
                .build();
        bookingRepository.save(existing);

        // Conflict check WITH exclusion of the same booking ID -> NO CONFLICT
        List<Booking> selfCheck = bookingRepository.findOverlapsExcluding(resId,
                LocalDate.of(2025, 1, 10), LocalDate.of(2025, 1, 15), bookingId);

        assertThat(selfCheck).isEmpty();

        // Conflict check WITHOUT exclusion (checking another ID) -> CONFLICT
        List<Booking> otherCheck = bookingRepository.findOverlapsExcluding(resId,
                LocalDate.of(2025, 1, 10), LocalDate.of(2025, 1, 15), "other-id");

        assertThat(otherCheck).hasSize(1);
    }

    @Test
    @DisplayName("Check: findOverlaps ignores CANCELLED bookings")
    void findOverlaps_ShouldIgnoreCancelled() {
        Booking cancelled = Booking.builder()
                .resourceId("room-101")
                .checkIn(LocalDate.of(2025, 2, 1))
                .checkOut(LocalDate.of(2025, 2, 5))
                .status(BookingStatus.CANCELLED)
                .mainGuest(createValidGuest())
                .build();
        bookingRepository.save(cancelled);

        List<Booking> result = bookingRepository.findOverlaps("room-101",
                LocalDate.of(2025, 2, 1), LocalDate.of(2025, 2, 5));

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Check: findActiveByResourceId returns only non-cancelled")
    void findActiveByResourceId_ShouldReturnOnlyActive() {
        Booking active = Booking.builder()
                .resourceId("A")
                .status(BookingStatus.CONFIRMED)
                .mainGuest(createValidGuest())
                .build();

        Booking cancelled = Booking.builder()
                .resourceId("A")
                .status(BookingStatus.CANCELLED)
                .mainGuest(createValidGuest())
                .build();

        Booking otherRes = Booking.builder()
                .resourceId("B")
                .status(BookingStatus.CONFIRMED)
                .mainGuest(createValidGuest())
                .build();

        bookingRepository.saveAll(List.of(active, cancelled, otherRes));

        List<Booking> results = bookingRepository.findActiveByResourceId("A");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    @DisplayName("Check: findByDateRange finds bookings contained within range")
    void findByDateRange_ShouldWorkCorrectly() {
        // first booking: 5-10 March (inside given range)
        Booking inside = Booking.builder()
                .checkIn(LocalDate.of(2025, 3, 5))
                .checkOut(LocalDate.of(2025, 3, 10))
                .mainGuest(createValidGuest())
                .build();

        // second booking: 1-4 March (out of range - before)
        Booking outsideBefore = Booking.builder()
                .checkIn(LocalDate.of(2025, 3, 1))
                .checkOut(LocalDate.of(2025, 3, 4))
                .mainGuest(createValidGuest())
                .build();

        // third booking: 15-20 March (out of range - after)
        Booking outsideAfter = Booking.builder()
                .checkIn(LocalDate.of(2025, 3, 15))
                .checkOut(LocalDate.of(2025, 3, 20))
                .mainGuest(createValidGuest())
                .build();

        bookingRepository.saveAll(List.of(inside, outsideBefore, outsideAfter));

        // search range: 4-12 March
        List<Booking> results = bookingRepository.findByDateRange(
                LocalDate.of(2025, 3, 4),
                LocalDate.of(2025, 3, 12)
        );

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getCheckIn()).isEqualTo(LocalDate.of(2025, 3, 5));
    }

    // Helper per creare un Guest valido con tutti i campi obbligatori
    private Guest createValidGuest() {
        return Guest.builder()
                .firstName("Mario")
                .lastName("Rossi")
                .sex(Sex.M)
                .guestType(GuestType.ADULT)
                .guestRole(GuestRole.HEAD_OF_FAMILY)
                .build();
    }
}