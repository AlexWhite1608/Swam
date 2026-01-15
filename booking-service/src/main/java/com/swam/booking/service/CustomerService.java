package com.swam.booking.service;

import com.swam.booking.domain.Customer;
import com.swam.booking.domain.Guest;
import com.swam.booking.dto.CreateCustomerRequest;
import com.swam.booking.dto.CustomerResponse;
import com.swam.booking.repository.CustomerRepository;
import com.swam.shared.exceptions.CustomerNotFoundException;
import com.swam.shared.exceptions.DuplicateCustomerException;
import com.swam.shared.exceptions.ResourceNotFoundException;
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

    public List<CustomerResponse> searchCustomers(String keyword) {
        return customerRepository.search(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CustomerResponse getCustomerById(String id) {
        Customer customer = getCustomerEntityOrThrow(id);
        return mapToResponse(customer);
    }

    //FIXME: gestione cliente duplicato
    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        if (customerRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateCustomerException(request.getEmail());
        }

        Customer customer = mapToEntity(request);
        customer.setCreatedAt(LocalDateTime.now());

        Customer saved = customerRepository.save(customer);
        return mapToResponse(saved);
    }

    @Transactional
    public CustomerResponse updateCustomer(String id, CreateCustomerRequest request) {
        Customer existing = getCustomerEntityOrThrow(id);

        updateEntityFromRequest(existing, request);
        existing.setUpdatedAt(LocalDateTime.now());

        Customer saved = customerRepository.save(existing);
        return mapToResponse(saved);
    }

    // upsert method used during booking process when a customer may already exist
    @Transactional
    public CustomerResponse registerOrUpdateCustomer(CreateCustomerRequest request) {
        // find by email first
        Optional<Customer> existingByEmail = customerRepository.findByEmail(request.getEmail());
        if (existingByEmail.isPresent()) {
            return updateCustomer(existingByEmail.get().getEmail(), request);
        }

        // find by document if provided
        if (request.getDocumentNumber() != null && request.getDocumentType() != null) {
            Optional<Customer> existingByDoc = customerRepository.findByDocumentTypeAndDocumentNumber(
                    request.getDocumentType(), request.getDocumentNumber());

            if (existingByDoc.isPresent()) {
                return updateCustomer(existingByDoc.get().getEmail(), request);
            }
        }

        // no existing customer found, create new one
        return createCustomer(request);
    }

    // used to create a snapshot of the customer at the time of booking (Guest)
    public Guest createGuestSnapshot(Customer customer) {
        return Guest.builder()
                .customerId(customer.getId()) // Link fondamentale al CRM
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .birthDate(customer.getBirthDate())
                .documentType(customer.getDocumentType())
                .documentNumber(customer.getDocumentNumber())
                .guestType(customer.getGuestType())
                .notes(customer.getNotes())
                .build();
    }

    private Customer getCustomerEntityOrThrow(String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
    }

    private CustomerResponse mapToResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .birthDate(customer.getBirthDate())
                .documentNumber(customer.getDocumentNumber())
                .documentType(customer.getDocumentType())
                .guestType(customer.getGuestType())
                .notes(customer.getNotes())
                .build();
    }

    private Customer mapToEntity(CreateCustomerRequest request) {
        return Customer.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .birthDate(request.getBirthDate())
                .documentNumber(request.getDocumentNumber())
                .documentType(request.getDocumentType())
                .guestType(request.getGuestType())
                .notes(request.getNotes())
                .build();
    }

    // updates entity fields from request fields
    private void updateEntityFromRequest(Customer target, CreateCustomerRequest source) {
        target.setFirstName(source.getFirstName());
        target.setLastName(source.getLastName());
        target.setPhone(source.getPhone());
        target.setAddress(source.getAddress());
        target.setBirthDate(source.getBirthDate());
        target.setDocumentNumber(source.getDocumentNumber());
        target.setDocumentType(source.getDocumentType());
        target.setGuestType(source.getGuestType());
        target.setNotes(source.getNotes());
    }
}