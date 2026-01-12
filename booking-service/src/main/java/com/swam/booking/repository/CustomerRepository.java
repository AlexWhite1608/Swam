package com.swam.booking.repository;

import com.swam.booking.domain.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends MongoRepository<Customer, String> {

    Optional<Customer> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Customer> findByPhone(String phone);

    // specific method to find by firstName and lastName exact match (two different inputs for first and last name)
    List<Customer> findByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);

    // partial match search across firstName, lastName, and email (google-like search)
    @Query("{ '$or': [ " +
            "   { 'firstName': { $regex: ?0, $options: 'i' } }, " +
            "   { 'lastName':  { $regex: ?0, $options: 'i' } }, " +
            "   { 'email':     { $regex: ?0, $options: 'i' } } " +
            "] }")
    List<Customer> search(String keyword);
}
