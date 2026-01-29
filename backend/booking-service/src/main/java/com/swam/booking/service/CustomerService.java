package com.swam.booking.service;

import com.swam.booking.domain.Customer;
import com.swam.booking.domain.Guest;
import com.swam.booking.dto.CheckInRequest;
import com.swam.booking.dto.CreateCustomerRequest;
import com.swam.booking.dto.CustomerResponse;
import com.swam.booking.repository.CustomerRepository;
import com.swam.shared.enums.GuestRole;
import com.swam.shared.exceptions.CustomerNotFoundException;
import com.swam.shared.exceptions.DuplicateCustomerException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CustomerResponse> searchCustomers(String keyword) {
        return customerRepository.search(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CustomerResponse getCustomerById(String id) {
        Customer customer = getCustomerEntityOrThrow(id);
        return mapToResponse(customer);
    }

    // create new customer
    //FIXME: gestione cliente duplicato
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        Customer customer = mapToEntity(request);
        customer.setCreatedAt(LocalDateTime.now());
        return mapToResponse(customerRepository.save(customer));
    }

    // update customer data
    private CustomerResponse updateCustomerEntity(Customer existing, CreateCustomerRequest request) {
        updateEntityFromRequest(existing, request);
        existing.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(customerRepository.save(existing));
    }

    // upsert for customer data
    @Transactional
    public CustomerResponse registerOrUpdateCustomer(CreateCustomerRequest request) {
        // find by email
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            Optional<Customer> existingByEmail = customerRepository.findByEmail(request.getEmail());
            if (existingByEmail.isPresent()) {
                return updateCustomerEntity(existingByEmail.get(), request);
            }
        }

        // find by document
        if (request.getDocumentNumber() != null && request.getDocumentType() != null) {
            Optional<Customer> existingByDoc = customerRepository.findByDocumentTypeAndDocumentNumber(
                    request.getDocumentType(), request.getDocumentNumber());
            if (existingByDoc.isPresent()) {
                return updateCustomerEntity(existingByDoc.get(), request);
            }
        }

        // else create new customer
        return createCustomer(request);
    }

    @Transactional
    public CustomerResponse registerOrUpdateCompanion(CheckInRequest.CompanionData data) {
        // check if a Customer with the same firstName, lastName, and birthDate exists
        Optional<Customer> existing = customerRepository.findByFirstNameAndLastNameAndBirthDate(
                data.getFirstName(), data.getLastName(), data.getBirthDate()
        );

        // if already exists, update only the fields provided in the "light" check-in companion data
        // FIXME: valutare se aggiornare anche firstName, lastName, birthDate
        if (existing.isPresent()) {
            Customer customer = existing.get();
            customer.setSex(data.getSex());
            customer.setPlaceOfBirth(data.getPlaceOfBirth());
            customer.setCitizenship(data.getCitizenship());
            customer.setGuestType(data.getGuestType());
            customer.setUpdatedAt(LocalDateTime.now());
            return mapToResponse(customerRepository.save(customer));
        }

        // if not exists, create a new light Customer with the provided data
        Customer newCustomer = Customer.builder()
                .firstName(data.getFirstName())
                .lastName(data.getLastName())
                .sex(data.getSex())
                .birthDate(data.getBirthDate())
                .placeOfBirth(data.getPlaceOfBirth())
                .citizenship(data.getCitizenship())
                .guestType(data.getGuestType())
                .createdAt(LocalDateTime.now())
                .build();

        return mapToResponse(customerRepository.save(newCustomer));
    }

    // used to create a snapshot of the customer at the time of booking (Guest)
    public Guest createGuestSnapshot(CustomerResponse customer, GuestRole role) {
        return Guest.builder()
                .customerId(customer.getId())

                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .sex(customer.getSex())
                .birthDate(customer.getBirthDate())
                .placeOfBirth(customer.getPlaceOfBirth())
                .citizenship(customer.getCitizenship()) // ISO Code

                .email(customer.getEmail())
                .phone(customer.getPhone())

                .documentType(customer.getDocumentType())
                .documentNumber(customer.getDocumentNumber())
                .documentPlaceOfIssue(customer.getDocumentPlaceOfIssue())

                .guestType(customer.getGuestType())
                .guestRole(role) // guestRole injection for booking infos

                .notes(customer.getNotes())
                .build();
    }

    public Customer getCustomerEntityOrThrow(String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
    }

    private CustomerResponse mapToResponse(Customer c) {
        return CustomerResponse.builder()
                .id(c.getId())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .sex(c.getSex())
                .email(c.getEmail())
                .phone(c.getPhone())
                .birthDate(c.getBirthDate())
                .placeOfBirth(c.getPlaceOfBirth())
                .citizenship(c.getCitizenship())
                .documentNumber(c.getDocumentNumber())
                .documentType(c.getDocumentType())
                .documentPlaceOfIssue(c.getDocumentPlaceOfIssue())
                .guestType(c.getGuestType())
                .notes(c.getNotes())
                .build();
    }

    private Customer mapToEntity(CreateCustomerRequest r) {
        return Customer.builder()
                .firstName(r.getFirstName())
                .lastName(r.getLastName())
                .sex(r.getSex())
                .email(r.getEmail())
                .phone(r.getPhone())
                .birthDate(r.getBirthDate())
                .placeOfBirth(r.getPlaceOfBirth())
                .citizenship(r.getCitizenship())
                .documentNumber(r.getDocumentNumber())
                .documentType(r.getDocumentType())
                .documentPlaceOfIssue(r.getDocumentPlaceOfIssue())
                .guestType(r.getGuestType())
                .notes(r.getNotes())
                .build();
    }

    // updates entity fields from request fields
    private void updateEntityFromRequest(Customer t, CreateCustomerRequest s) {
        t.setFirstName(s.getFirstName());
        t.setLastName(s.getLastName());
        t.setSex(s.getSex());
        t.setEmail(s.getEmail());
        t.setPhone(s.getPhone());
        t.setBirthDate(s.getBirthDate());
        t.setPlaceOfBirth(s.getPlaceOfBirth());
        t.setCitizenship(s.getCitizenship());
        t.setDocumentNumber(s.getDocumentNumber());
        t.setDocumentType(s.getDocumentType());
        t.setDocumentPlaceOfIssue(s.getDocumentPlaceOfIssue());
        t.setGuestType(s.getGuestType());
        t.setNotes(s.getNotes());
    }
}