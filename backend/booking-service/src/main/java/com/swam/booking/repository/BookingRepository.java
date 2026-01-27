package com.swam.booking.repository;

import com.swam.booking.domain.Booking;
import com.swam.shared.enums.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

 /**
 * Overlap Detection
 *
 * Finds bookings that conflict with the requested interval.
 * Conflict Rule: (StartA < EndB) AND (EndA > StartB)
 *
 * @param resourceId The ID of the resource to check
 * @param newCheckIn The requested check-in date (corresponds to parameter ?1 in the query)
 * @param newCheckOut The requested check-out date (corresponds to parameter ?2 in the query)
 * @return A list of conflicting bookings. If empty, the resource is available.
 */
    @Query("{ " +
            "  'resourceId': ?0, " +
            "  'status': { $ne: 'CANCELLED' }, " +
            "  'checkIn': { $lt: ?2 }, " +
            "  'checkOut': { $gt: ?1 } " +
            "}")
    List<Booking> findOverlaps(String resourceId, LocalDate newCheckIn, LocalDate newCheckOut);

    // finds all active bookings (not CANCELLED) for a given resource
    @Query("{ 'resourceId': ?0, 'status': { $ne: 'CANCELLED' } }")
    List<Booking> findActiveByResourceId(String resourceId);

    // find bookings by main guest id
    List<Booking> findByMainGuestId(String guestId);

    // find bookings by resourceId
    List<Booking> findByResourceId(String resourceId);

    // find all bookings within a date range
    @Query("{ 'checkIn': { $gte: ?0 }, 'checkOut': { $lte: ?1 } }")
    List<Booking> findByDateRange(LocalDate startDate, LocalDate endDate);
}