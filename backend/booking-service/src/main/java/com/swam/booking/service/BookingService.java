package com.swam.booking.service;

import com.swam.booking.client.PricingServiceClient;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CustomerService customerService;
    private final ExtraOptionService extraOptionService;
    private final PricingServiceClient pricingClient;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {

        // Validazione date
        validateDates(request.getResourceId(), request.getCheckIn(), request.getCheckOut());

        // Creazione Customer
        CreateCustomerRequest partialCustomer = CreateCustomerRequest.builder()
                .firstName(request.getGuestFirstName())
                .lastName(request.getGuestLastName())
                .email(request.getGuestEmail())
                .phone(request.getGuestPhone() != null ? request.getGuestPhone() : "")
                .address(null)
                .build();

        CustomerResponse customer = customerService.registerOrUpdateCustomer(partialCustomer);
        Guest snapshot = customerService.createGuestSnapshot(customer);

        // CHIAMATA AL PRICING SERVICE
        PriceCalculationRequest pricingRequest = PriceCalculationRequest.builder()
                .resourceId(request.getResourceId())
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .numAdults(1) // Default 1 adulto
                .numChildren(0)
                .numInfants(0)
                .depositAmount(request.getDepositAmount()) // Passiamo l'acconto
                .extras(Collections.emptyList()) // Nessun extra alla creazione
                .build();

        PriceBreakdown initialPrice = pricingClient.calculateQuote(pricingRequest);

        // Salvataggio Booking
        Booking booking = Booking.builder()
                .resourceId(request.getResourceId())
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .status(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .mainGuest(snapshot)
                .companions(new ArrayList<>())
                .extras(new ArrayList<>())
                .priceBreakdown(initialPrice)
                .createdAt(LocalDateTime.now())
                .updatedAt(null)
                .build();

        return mapToResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse checkIn(String bookingId, CheckInRequest request) {
        Booking booking = getBookingOrThrow(bookingId);

        LocalDate today = LocalDate.now();

        if (booking.getStatus() != BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingDateException("Check-in non valido per lo stato attuale.");
        }

        // Aggiornamento Customer
        Customer customerEntity = customerService.getCustomerEntityOrThrow(booking.getMainGuest().getCustomerId());
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
        booking.setMainGuest(customerService.createGuestSnapshot(updatedCustomer));

        // Aggiunta Compagni
        if (request.getCompanions() != null) {
            List<Guest> companions = request.getCompanions().stream()
                    .map(c -> Guest.builder()
                            .firstName(c.getFirstName())
                            .lastName(c.getLastName())
                            .birthDate(c.getBirthDate())
                            .guestType(c.getGuestType())
                            .address(booking.getMainGuest().getAddress())
                            .email("")
                            .phone("")
                            .documentNumber("")
                            .build())
                    .collect(Collectors.toList());
            booking.setCompanions(companions);
        }

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

        // Gestione Extra: Salvataggio locale (Snapshot)
        List<BookingExtra> finalExtras = processExtras(request.getExtras());
        booking.setExtras(finalExtras);

        // Mappiamo gli extra del booking nel formato che il Pricing si aspetta per il calcolo
        List<PriceCalculationRequest.BillableExtraItem> billableExtras = finalExtras.stream()
                .map(extra -> new PriceCalculationRequest.BillableExtraItem(
                        extra.getPriceSnapshot(), // Usiamo il prezzo congelato nello snapshot
                        extra.getQuantity()
                ))
                .collect(Collectors.toList());

        // Calcolo ospiti reali
        int adults = (booking.getMainGuest().getGuestType() == GuestType.ADULT ? 1 : 0) +
                (int) booking.getCompanions().stream().filter(c -> c.getGuestType() == GuestType.ADULT).count();

        int children = (booking.getMainGuest().getGuestType() == GuestType.CHILD ? 1 : 0) +
                (int) booking.getCompanions().stream().filter(c -> c.getGuestType() == GuestType.CHILD).count();

        int infants = (booking.getMainGuest().getGuestType() == GuestType.INFANT ? 1 : 0) +
                (int) booking.getCompanions().stream().filter(c -> c.getGuestType() == GuestType.INFANT).count();

        PriceCalculationRequest pricingRequest = PriceCalculationRequest.builder()
                .resourceId(booking.getResourceId())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .numAdults(adults)
                .numChildren(children)
                .numInfants(infants)
                .taxExempt(booking.getMainGuest().isTaxExempt())
                .depositAmount(booking.getPriceBreakdown().getDepositAmount())
                .extras(billableExtras)
                .build();


        // Il Pricing Service ci restituisce un oggetto completo: Base + Tasse + Extra - Acconto
        PriceBreakdown finalPriceBreakdown = pricingClient.calculateQuote(pricingRequest);

        booking.setPriceBreakdown(finalPriceBreakdown);

        booking.setStatus(BookingStatus.CHECKED_OUT);
        booking.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(bookingRepository.save(booking));
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
            throw new IllegalStateException("Solo PENDING può essere confermata");

        if(hasPaidDeposit) {
            booking.setPaymentStatus(PaymentStatus.DEPOSIT_PAID);
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(bookingRepository.save(booking));
    }

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
    }

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