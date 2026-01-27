package com.swam.booking.service;

import com.swam.booking.domain.*;
import com.swam.booking.dto.*;
import com.swam.booking.repository.BookingRepository;
import com.swam.shared.dto.PriceBreakdown;
import com.swam.shared.enums.BookingStatus;
import com.swam.shared.enums.GuestType;
import com.swam.shared.enums.PaymentStatus;
import com.swam.shared.exceptions.InvalidBookingDateException;
import com.swam.shared.exceptions.ResourceNotFoundException;
import com.swam.shared.exceptions.SlotNotAvailableException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CustomerService customerService;
    private final ExtraOptionService extraOptionService;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {

        // validate input dates
        validateDates(request.getResourceId(), request.getCheckIn(), request.getCheckOut());

        // create starting booking record with PENDING status
        Booking booking = Booking.builder()
                .resourceId(request.getResourceId())
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .status(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .mainGuest(Guest.builder()
                        .firstName(request.getGuestFirstName())
                        .lastName(request.getGuestLastName())
                        .email(request.getGuestEmail())
                        .phone(request.getGuestPhone())
                        .guestType(GuestType.ADULT)
                        .build())
                .companions(new ArrayList<>())
                .extras(new ArrayList<>())
                .priceBreakdown(PriceBreakdown.builder()
                        .baseAmount(BigDecimal.ZERO)
                        .depositAmount(request.getDepositAmount())
                        .taxAmount(BigDecimal.ZERO)
                        .discountAmount(BigDecimal.ZERO)
                        .extrasAmount(BigDecimal.ZERO)
                        .finalTotal(BigDecimal.ZERO)
                        .taxDescription(null)
                        .build())
                .createdAt(LocalDateTime.now())
                .updatedAt(null)
                .build();

        return mapToResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse checkIn(String bookingId, CheckInRequest request) {
        Booking booking = getBookingOrThrow(bookingId);

        LocalDate today = LocalDate.now();
        if (booking.getCheckIn().isAfter(today)) {
            throw new InvalidBookingDateException("Check-in non ancora disponibile");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingDateException("Check-in non valido per lo stato attuale.");
        }

        // fills the customer record with complete data
        Customer customerEntity = customerService.getCustomerEntityOrThrow(booking.getMainGuest().getCustomerId());

        // creates a full customer record merging existing and new data
        CreateCustomerRequest fullData = CreateCustomerRequest.builder()
                .firstName(customerEntity.getFirstName())
                .lastName(customerEntity.getLastName())
                .email(customerEntity.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .birthDate(request.getBirthDate())
                .documentType(request.getDocumentType())
                .documentNumber(request.getDocumentNumber())
                .country(request.getCountry())
                .guestType(request.getGuestType())
                .build();

        CustomerResponse updatedCustomer = customerService.registerOrUpdateCustomer(fullData);

        // updates guest snapshot
        booking.setMainGuest(customerService.createGuestSnapshot(updatedCustomer));

        // adds companions if any
        if (request.getCompanions() != null) {
            List<Guest> companions = request.getCompanions().stream()
                    .map(c -> Guest.builder()
                            .firstName(c.getFirstName())
                            .lastName(c.getLastName())
                            .birthDate(c.getBirthDate())
                            .guestType(c.getGuestType())
                            .address(booking.getMainGuest().getAddress())
                            .email("") // FIXME: da richiedere?
                            .phone("") // FIXME: da richiedere?
                            .documentNumber("") // FIXME: da richiedere?
                            .build())
                    .collect(Collectors.toList());
            booking.setCompanions(companions);
        }

        //TODO: GESTIONE ANAGRAFICA COMPANIONS

        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse checkOut(String bookingId, CheckOutRequest request) {
        Booking booking = getBookingOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new InvalidBookingDateException("Il Check-out richiede stato CHECKED_IN.");
        }

        // add extras
        List<BookingExtra> finalExtras = processExtras(request.getExtras());
        booking.setExtras(finalExtras);

        // TODO: calcola prezzo finale nel pricing service
        PriceBreakdown finalPrice = PriceBreakdown.builder()
                .baseAmount(BigDecimal.ZERO)      // TODO: calcolare;
                .depositAmount(booking.getPriceBreakdown().getDepositAmount())
                .taxAmount(BigDecimal.ZERO)       // TODO: calcolare
                .discountAmount(BigDecimal.ZERO)  // TODO: calcolare
                .extrasAmount(finalExtras.stream()
                        .map(extra -> extra.getPriceSnapshot().multiply(BigDecimal.valueOf(extra.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .finalTotal(BigDecimal.ZERO)      // TODO: calcolare
                .taxDescription(null)             // TODO: aggiungere descrizione tasse
                .build();
        booking.setPriceBreakdown(finalPrice);

        booking.setStatus(BookingStatus.CHECKED_OUT);
        booking.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(bookingRepository.save(booking));
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // get unavailable periods for a resource
    public List<UnavailablePeriodResponse> getUnavailablePeriods(String resourceId) {
        List<Booking> bookings = bookingRepository.findActiveByResourceId(resourceId);

        LocalDate today = LocalDate.now();

        return bookings.stream()
                // excludes past bookings where check-out is before today
                .filter(booking -> booking.getCheckOut().isAfter(today))
                .map(booking -> UnavailablePeriodResponse.builder()
                        .start(booking.getCheckIn())
                        .end(booking.getCheckOut())
                        .build())
                .collect(Collectors.toList());
    }

    public BookingResponse getBooking(String bookingId) {
        return mapToResponse(getBookingOrThrow(bookingId));
    }

    public List<BookingResponse> getBookingsByResource(String resourceId) {
        return bookingRepository.findByResourceId(resourceId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByMainGuest(String customerId) {
        return bookingRepository.findByMainGuestId(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse confirmBooking(String bookingId, boolean hasPaidDeposit) {
        Booking booking = getBookingOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING)
            throw new IllegalStateException("Impossibile confermare una prenotazione che non è in attesa.");

        BigDecimal depositAmount = booking.getPriceBreakdown().getDepositAmount();
        boolean hasDepositToPay = depositAmount != null && depositAmount.compareTo(BigDecimal.ZERO) > 0;

        // set payment status based on deposit payment
        if (hasPaidDeposit && hasDepositToPay) {
            booking.setPaymentStatus(PaymentStatus.DEPOSIT_PAID);
        }

        // update booking status to CONFIRMED
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(bookingRepository.save(booking));
    }

    // check date validity and availability
    private void validateDates(String resourceId, LocalDate in, LocalDate out) {
        if (!out.isAfter(in))
            throw new InvalidBookingDateException("La data di check-out deve essere successiva alla data di check-in.");
        if (!bookingRepository.findOverlaps(resourceId, in, out).isEmpty()) {
            throw new SlotNotAvailableException(resourceId);
        }
    }

    private List<BookingExtra> processExtras(List<CheckOutRequest.ConsumedExtra> requestExtras) {
        if (requestExtras == null) return new ArrayList<>();
        List<BookingExtra> result = new ArrayList<>();
        for (var item : requestExtras) {
            ExtraOption option = extraOptionService.getExtraEntity(item.getExtraOptionId());
            result.add(BookingExtra.builder()
                    .extraOptionId(option.getId())
                    .nameSnapshot(option.getName())
                    .priceSnapshot(option.getDefaultPrice())
                    .quantity(item.getQuantity())
                    .build());
        }
        return result;
    }

    private Booking getBookingOrThrow(String id) {
        return bookingRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    @Transactional
    public BookingResponse updatePaymentStatus(String bookingId, PaymentStatus newStatus) {
        Booking booking = getBookingOrThrow(bookingId);

        validatePaymentStatusTransition(booking.getPaymentStatus(), newStatus);

        booking.setPaymentStatus(newStatus);
        booking.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(bookingRepository.save(booking));
    }

    private void validatePaymentStatusTransition(PaymentStatus current, PaymentStatus next) {
        if (current == PaymentStatus.PAID_IN_FULL && next == PaymentStatus.DEPOSIT_PAID) {
            throw new IllegalStateException("Non puoi tornare a DEPOSIT_PAID da PAID_IN_FULL");
        }

        // TODO: Aggiungere altre regole di transizione se necessario
    }


    // mapToResponse omesso per brevità (identico a prima)
    private BookingResponse mapToResponse(Booking booking) {
        PriceBreakdown pbResponse = null;

        if (booking.getPriceBreakdown() != null) {
            pbResponse = PriceBreakdown.builder()
                    .baseAmount(booking.getPriceBreakdown().getBaseAmount())
                    .depositAmount(booking.getPriceBreakdown().getDepositAmount())
                    .taxAmount(booking.getPriceBreakdown().getTaxAmount())
                    .discountAmount(booking.getPriceBreakdown().getDiscountAmount())
                    .extrasAmount(booking.getPriceBreakdown().getExtrasAmount())
                    .finalTotal(booking.getPriceBreakdown().getFinalTotal())
                    .taxDescription(booking.getPriceBreakdown().getTaxDescription())
                    .build();
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .resourceId(booking.getResourceId())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .priceBreakdown(pbResponse)
                .mainGuest(booking.getMainGuest())
                .companions(booking.getCompanions())
                .extras(booking.getExtras())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}