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
    private final PricingServiceClient pricingClient;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {

        // validate input dates
        validateDates(request.getResourceId(), request.getCheckIn(), request.getCheckOut(), null);

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
                        .build())
                .createdAt(LocalDateTime.now())
                .updatedAt(null)
                .build();

        return mapToResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse updateBooking(String bookingId, CreateBookingRequest request) {
        Booking booking = getBookingOrThrow(bookingId);

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new IllegalStateException("Non può essere modificata una prenotazione conclusa o cancellata.");
        }

        // check if dates or resource have changed
        boolean datesChanged = !booking.getCheckIn().equals(request.getCheckIn()) ||
                !booking.getCheckOut().equals(request.getCheckOut());
        boolean resourceChanged = !booking.getResourceId().equals(request.getResourceId());

        if (datesChanged || resourceChanged) {
            // cannot move check-in date to future if already checked-in
            if (booking.getStatus() == BookingStatus.CHECKED_IN && request.getCheckIn().isAfter(LocalDate.now())) {
                throw new InvalidBookingDateException("Non puoi spostare il check-in nel futuro se l'ospite è già in struttura.");
            }

            // check availability for new dates/resource (excluding current booking)
            validateDates(request.getResourceId(), request.getCheckIn(), request.getCheckOut(), bookingId);
        }

        // update resource and dates
        booking.setResourceId(request.getResourceId());
        booking.setCheckIn(request.getCheckIn());
        booking.setCheckOut(request.getCheckOut());

        // get current guest snapshot with validation
        Guest currentGuest = getGuest(request, booking);

        // update new guest snapshot
        Guest updatedGuest = currentGuest.toBuilder()
                .firstName(request.getGuestFirstName())
                .lastName(request.getGuestLastName())
                .email(request.getGuestEmail())
                .phone(request.getGuestPhone())
                .build();

        booking.setMainGuest(updatedGuest);

        // update deposit amount
        booking.getPriceBreakdown().setDepositAmount(request.getDepositAmount());

        booking.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(bookingRepository.save(booking));
    }

    // edit stay details (dates, resource) of an existing booking
    @Transactional
    public BookingResponse updateBookingStay(String bookingId, EditBookingStayRequest request) {
        Booking booking = getBookingOrThrow(bookingId);

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new IllegalStateException("Non puoi modificare una prenotazione conclusa o cancellata.");
        }

        if (booking.getStatus() == BookingStatus.CHECKED_IN) {
            // if already checked-in, cannot move check-in to future
            if (request.getCheckIn().isAfter(LocalDate.now())) {
                throw new InvalidBookingDateException("Il check-in non può essere spostato nel futuro per una prenotazione in corso.");
            }
        }

        // check availability if dates or resource changed (excluding current booking)
        boolean changed = !booking.getResourceId().equals(request.getResourceId()) ||
                !booking.getCheckIn().equals(request.getCheckIn()) ||
                !booking.getCheckOut().equals(request.getCheckOut());

        if (changed) {
            validateDates(request.getResourceId(), request.getCheckIn(), request.getCheckOut(), bookingId);

            booking.setResourceId(request.getResourceId());
            booking.setCheckIn(request.getCheckIn());
            booking.setCheckOut(request.getCheckOut());

            booking.setUpdatedAt(LocalDateTime.now());
        }

        return mapToResponse(bookingRepository.save(booking));
    }

    // cancels an existing booking by setting its status to CANCELLED
    @Transactional
    public BookingResponse cancelBooking(String bookingId) {
        Booking booking = getBookingOrThrow(bookingId);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("La prenotazione è già stata cancellata.");
        }

        // cannot cancel a booking that has already been checked out or checked in
        if (booking.getStatus() == BookingStatus.CHECKED_OUT || booking.getStatus() == BookingStatus.CHECKED_IN) {
            throw new IllegalStateException("Non puoi annullare una prenotazione già conclusa.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(bookingRepository.save(booking));
    }

    // soft delete of the selected booking
    @Transactional
    public void deleteBooking(String bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new ResourceNotFoundException("Risorsa non trovata: " + bookingId);
        }
        bookingRepository.deleteById(bookingId);
    }

    // bulk delete bookings
    @Transactional
    public void deleteBookings(List<String> ids) {
        // if the list is null or empty, do nothing
        if (ids == null || ids.isEmpty()) {
            return;
        }

        bookingRepository.deleteAllById(ids);
    }

    @Transactional
    public BookingResponse checkIn(String bookingId, CheckInRequest request) {
        Booking booking = getBookingOrThrow(bookingId);

        if (booking.getStatus() == BookingStatus.CHECKED_IN) {
            throw new IllegalStateException("La prenotazione ha già effettuato il check-in.");
        }
        if (booking.getStatus() != BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingDateException("Check-in non valido per lo stato attuale.");
        }

        // main guest
        CreateCustomerRequest mainGuestData = CreateCustomerRequest.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .sex(request.getSex())
                .birthDate(request.getBirthDate())
                .email(request.getEmail())
                .phone(request.getPhone())
                .placeOfBirth(request.getPlaceOfBirth())
                .citizenship(request.getCitizenship())
                .documentType(request.getDocumentType())
                .documentNumber(request.getDocumentNumber())
                .documentPlaceOfIssue(request.getDocumentPlaceOfIssue())
                .guestType(request.getGuestType())
                .build();

        CustomerResponse mainCustomer = customerService.registerOrUpdateCustomer(mainGuestData);

        // main guest snapshot for booking, adds guestRole
        Guest mainGuestSnapshot = customerService.createGuestSnapshot(mainCustomer, request.getGuestRole());
        booking.setMainGuest(mainGuestSnapshot);

        // set eventual notes
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            booking.setNotes(request.getNotes());
        }

        // companions data
        List<Guest> companionSnapshots = new ArrayList<>();

        if (request.getCompanions() != null) {
            for (CheckInRequest.CompanionData compData : request.getCompanions()) {

                // register companion data
                CustomerResponse compCustomer = customerService.registerOrUpdateCompanion(compData);

                // companion snapshot
                Guest companionSnapshot = customerService.createGuestSnapshot(compCustomer, compData.getGuestRole());

                companionSnapshots.add(companionSnapshot);
            }
        }
        booking.setCompanions(companionSnapshots);

        // status update
        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(bookingRepository.save(booking));
    }

    //TODO: gestione prenotazione split da unificare con check-out
    @Transactional
    public BookingResponse checkOut(String bookingId, CheckOutRequest request) {
        Booking booking = getBookingOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new InvalidBookingDateException("Il Check-out richiede stato CHECKED_IN.");
        }

        List<BookingExtra> finalExtras = processExtras(request.getExtras());
        booking.setExtras(finalExtras);

        List<PriceCalculationRequest.BillableExtraItem> billableExtras = finalExtras.stream()
                .map(extra -> new PriceCalculationRequest.BillableExtraItem(
                        extra.getPriceSnapshot(),
                        extra.getQuantity()
                ))
                .collect(Collectors.toList());

        // calculate max days of booking
        int maxBookingDays = (int) java.time.temporal.ChronoUnit.DAYS.between(booking.getCheckIn(), booking.getCheckOut());

        // creation of full guest list (main + companions)
        List<Guest> allGuests = new ArrayList<>();
        allGuests.add(booking.getMainGuest());
        if (booking.getCompanions() != null) {
            allGuests.addAll(booking.getCompanions());
        }

        // mapping to GuestProfile for pricing request
        List<PriceCalculationRequest.GuestProfile> guestProfiles = allGuests.stream()
                .map(g -> {
                    int realDays = (g.getDaysOfStay() == null || g.getDaysOfStay() <= 0)
                            ? maxBookingDays
                            : Math.min(g.getDaysOfStay(), maxBookingDays);

                    return PriceCalculationRequest.GuestProfile.builder()
                            .type(g.getGuestType())
                            .taxExempt(g.isTaxExempt())
                            .days(realDays)
                            .taxExemptMotivation(g.getTaxExemptReason())
                            .build();
                })
                .collect(Collectors.toList());

        // creation of pricing request
        PriceCalculationRequest pricingRequest = PriceCalculationRequest.builder()
                .resourceId(booking.getResourceId())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .guests(guestProfiles)
                .depositAmount(booking.getPriceBreakdown().getDepositAmount())
                .extras(billableExtras)
                .build();

        // call pricing service to calculate final price
        PriceBreakdown finalPriceBreakdown = pricingClient.calculateQuote(pricingRequest);
        booking.setPriceBreakdown(finalPriceBreakdown);
        booking.setStatus(BookingStatus.CHECKED_OUT);
        booking.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(bookingRepository.save(booking));
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // get unavailable periods for a resource (excluding optional booking)
    public List<UnavailablePeriodResponse> getUnavailablePeriods(String resourceId, String excludeBookingId) {
        List<Booking> bookings = bookingRepository.findActiveByResourceId(resourceId);

        LocalDate today = LocalDate.now();

        return bookings.stream()
                // exclude past bookings
                .filter(booking -> booking.getCheckOut().isAfter(today))
                // exclude the specified booking if provided (in case of editing)
                .filter(booking -> !booking.getId().equals(excludeBookingId))
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

    // checks date validity and availability
    private void validateDates(String resourceId, LocalDate in, LocalDate out, String excludeBookingId) {
        if (!out.isAfter(in)) {
            throw new InvalidBookingDateException("La data di check-out deve essere successiva alla data di check-in.");
        }

        List<Booking> overlaps;

        if (excludeBookingId == null) {
            // case of creation: no booking to exclude
            overlaps = bookingRepository.findOverlaps(resourceId, in, out);
        } else {
            // case of update: exclude the current booking from overlap check
            overlaps = bookingRepository.findOverlapsExcluding(resourceId, in, out, excludeBookingId);
        }

        // if there are overlapping bookings, throw exception
        if (!overlaps.isEmpty()) {
            throw new SlotNotAvailableException(resourceId);
        }
    }

    // retrieves the current guest and performs validation for check-in status
    private static Guest getGuest(CreateBookingRequest request, Booking booking) {
        Guest currentGuest = booking.getMainGuest();

        // Validazione specifica per Check-in
        if (booking.getStatus() == BookingStatus.CHECKED_IN) {
            if (!currentGuest.getFirstName().equals(request.getGuestFirstName()) ||
                    !currentGuest.getLastName().equals(request.getGuestLastName())) {
                throw new IllegalStateException("Non può essere cambiato il titolare della prenotazione dopo il check-in. ");
            }
        }
        return currentGuest;
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

    // update booking guests during CHECKED_IN status
    @Transactional
    public BookingResponse updateBookingCheckIn(String bookingId, CheckInRequest request) {
        Booking booking = getBookingOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new IllegalStateException("Modifica consentita solo per prenotazioni nello stato CHECKED_IN.");
        }

        CreateCustomerRequest mainGuestData = CreateCustomerRequest.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .sex(request.getSex())
                .birthDate(request.getBirthDate())
                .email(request.getEmail())
                .phone(request.getPhone())
                .placeOfBirth(request.getPlaceOfBirth())
                .citizenship(request.getCitizenship())
                .documentType(request.getDocumentType())
                .documentNumber(request.getDocumentNumber())
                .documentPlaceOfIssue(request.getDocumentPlaceOfIssue())
                .guestType(request.getGuestType())
                .build();

        CustomerResponse mainCustomer = customerService.registerOrUpdateCustomer(mainGuestData);

        Guest mainGuestSnapshot = customerService.createGuestSnapshot(mainCustomer, request.getGuestRole());
        booking.setMainGuest(mainGuestSnapshot);

        if (request.getNotes() != null) {
            booking.setNotes(request.getNotes());
        }

        List<Guest> companionSnapshots = new ArrayList<>();

        if (request.getCompanions() != null) {
            for (CheckInRequest.CompanionData compData : request.getCompanions()) {
                CustomerResponse compCustomer = customerService.registerOrUpdateCompanion(compData);

                Guest companionSnapshot = customerService.createGuestSnapshot(compCustomer, compData.getGuestRole());
                companionSnapshots.add(companionSnapshot);
            }
        }

        booking.setCompanions(companionSnapshots);

        booking.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(bookingRepository.save(booking));
    }

    // extend an existing booking by creating a new linked booking segment
    @Transactional
    public BookingResponse extendStayWithSplit(String currentBookingId, ExtendBookingRequest request) {
        Booking currentBooking = getBookingOrThrow(currentBookingId);

        // new time interval for the extension, starts from current check-out
        LocalDate newCheckInDate = currentBooking.getCheckOut();
        LocalDate newCheckOutDate = request.getNewCheckOutDate();

        if (!newCheckOutDate.isAfter(newCheckInDate)) {
            throw new InvalidBookingDateException("La data di fine estensione deve essere successiva alla fine del soggiorno attuale.");
        }

        // check validity and availability of new segment (NO EXCLUSION here. because it's a new booking)
        validateDates(request.getNewResourceId(), newCheckInDate, newCheckOutDate, null);

        // groupId management
        String groupId = currentBooking.getGroupId();
        if (groupId == null) {
            // if it's the first extension, create a new groupId and assign to current booking
            groupId = java.util.UUID.randomUUID().toString();
            currentBooking.setGroupId(groupId);
            bookingRepository.save(currentBooking); // update father booking
        }

        // clone existing data for the new segment
        Booking extension = Booking.builder()
                .resourceId(request.getNewResourceId())
                .checkIn(newCheckInDate)
                .checkOut(newCheckOutDate)

                // born as CONFIRMED, will be checked-in later with existing guest data
                .status(currentBooking.getStatus())
                .paymentStatus(currentBooking.getPaymentStatus())

                // clone main guest and companions data
                .mainGuest(currentBooking.getMainGuest())
                .companions(new ArrayList<>(currentBooking.getCompanions()))

                // link to group and parent booking
                .groupId(groupId)
                .parentBookingId(currentBooking.getId())
                .priceBreakdown(currentBooking.getPriceBreakdown())
                .createdAt(LocalDateTime.now())
                .build();

        Booking savedExtension = bookingRepository.save(extension);

        return mapToResponse(savedExtension);
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
                    .build();
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .groupId(booking.getGroupId())
                .parentBookingId(booking.getParentBookingId())
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