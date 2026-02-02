package com.swam.booking.controller;

import com.swam.booking.dto.*;
import com.swam.booking.service.BookingService;
import com.swam.resource.dto.BulkDeleteRequest;
import com.swam.shared.enums.PaymentStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBooking(id));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<BookingResponse> bookings = bookingService.getAllBookings();
        if (bookings.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(bookings);
    }

    // confirms a pending booking
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<BookingResponse> confirmBooking(
            @PathVariable String id,
            @RequestParam(defaultValue = "false") boolean hasPaidDeposit) {
        return ResponseEntity.ok(bookingService.confirmBooking(id, hasPaidDeposit));
    }

    // updates an existing base booking (with status PENDING or CONFIRMED)
    @PutMapping("/{id}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody CreateBookingRequest request) {
        return ResponseEntity.ok(bookingService.updateBooking(id, request));
    }

    // updates the stay details of an existing booking
    @PatchMapping("/{id}/stay")
    public ResponseEntity<BookingResponse> updateBookingStay(
            @PathVariable String id,
            @Valid @RequestBody EditBookingStayRequest request) {
        return ResponseEntity.ok(bookingService.updateBookingStay(id, request));
    }

    // update check in guests info
    @PutMapping("/{id}/update-check-in")
    public ResponseEntity<BookingResponse> updateBookingCheckIn(
            @PathVariable String id,
            @Valid @RequestBody CheckInRequest request) {
        return ResponseEntity.ok(bookingService.updateBookingCheckIn(id, request));
    }

    //TODO: endpoint PUT /api/bookings/{id}/extras per modifica extra del booking

    // cancels an existing booking by setting its status to CANCELLED
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    @PostMapping("/{id}/check-in")
    public ResponseEntity<BookingResponse> checkIn(
            @PathVariable String id,
            @Valid @RequestBody CheckInRequest request) {
        return ResponseEntity.ok(bookingService.checkIn(id, request));
    }

    @PostMapping("/{id}/check-out")
    public ResponseEntity<BookingResponse> checkOut(
            @PathVariable String id,
            @Valid @RequestBody CheckOutRequest request) {
        return ResponseEntity.ok(bookingService.checkOut(id, request));
    }

    // returns unavailable dates for a specific resource, optionally excluding a booking
    @GetMapping("/unavailable-dates")
    public ResponseEntity<List<UnavailablePeriodResponse>> getUnavailableDates(
            @RequestParam String resourceId,
            @RequestParam(required = false) String excludeBookingId) {
        return ResponseEntity.ok(bookingService.getUnavailablePeriods(resourceId, excludeBookingId));
    }

    // updates the payment status of a booking
    @PatchMapping("/{id}/payment-status")
    public ResponseEntity<BookingResponse> updatePaymentStatus(
            @PathVariable String id,
            @RequestParam PaymentStatus status) {
        return ResponseEntity.ok(bookingService.updatePaymentStatus(id, status));
    }

    // bulk Delete bookings
    @PostMapping("/bulk-delete")
    public ResponseEntity<Void> bulkDelete(@RequestBody BulkDeleteRequest request) {
        bookingService.deleteBookings(request.getIds());
        return ResponseEntity.noContent().build();
    }
}