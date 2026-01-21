package com.swam.booking.service;

import com.swam.booking.domain.Customer;
import com.swam.booking.domain.Guest;
import com.swam.booking.dto.CreateCustomerRequest;
import com.swam.booking.dto.CustomerResponse;
import com.swam.booking.repository.CustomerRepository;
import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestType;
import com.swam.shared.exceptions.CustomerNotFoundException;
import com.swam.shared.exceptions.DuplicateCustomerException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    @Test
    @DisplayName("Create: Should create new customer when email is unique")
    void createCustomer_ShouldCreate_WhenEmailIsUnique() {
        CreateCustomerRequest request = buildRequest();
        when(customerRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> {
            Customer c = invocation.getArgument(0);
            c.setId("cust-123");
            return c;
        });

        CustomerResponse response = customerService.createCustomer(request);

        assertNotNull(response.getId());
        assertEquals(request.getEmail(), response.getEmail());
        assertEquals(request.getFirstName(), response.getFirstName());
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    @DisplayName("Create: Should throw exception when email already exists")
    void createCustomer_ShouldThrow_WhenEmailDuplicate() {
        CreateCustomerRequest request = buildRequest();
        when(customerRepository.findByEmail(request.getEmail()))
                .thenReturn(Optional.of(new Customer()));

        assertThrows(DuplicateCustomerException.class, () -> customerService.createCustomer(request));
        verify(customerRepository, never()).save(any());
    }

    @Test
    @DisplayName("Upsert: Should UPDATE existing customer found by Email")
    void registerOrUpdate_ShouldUpdate_WhenFoundByEmail() {
        CreateCustomerRequest request = buildRequest();
        request.setPhone("+39999999999");

        Customer existing = buildCustomerEntity();

        when(customerRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(existing));
        when(customerRepository.findById(anyString())).thenReturn(Optional.of(existing));
        when(customerRepository.save(any(Customer.class))).thenReturn(existing);

        customerService.registerOrUpdateCustomer(request);

        ArgumentCaptor<Customer> captor = ArgumentCaptor.forClass(Customer.class);
        verify(customerRepository).save(captor.capture());

        Customer savedCustomer = captor.getValue();
        assertEquals("+39999999999", savedCustomer.getPhone());
        assertNotNull(savedCustomer.getUpdatedAt());
    }

    @Test
    @DisplayName("Upsert: Should UPDATE existing customer found by Document (Email changed)")
    void registerOrUpdate_ShouldUpdate_WhenFoundByDocument() {
        CreateCustomerRequest request = buildRequest();
        request.setEmail("new.email@test.com");

        Customer existing = buildCustomerEntity();

        // not found by email
        when(customerRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        // found by document
        when(customerRepository.findByDocumentTypeAndDocumentNumber(request.getDocumentType(), request.getDocumentNumber()))
                .thenReturn(Optional.of(existing));

        when(customerRepository.findById(anyString())).thenReturn(Optional.of(existing));
        when(customerRepository.save(any(Customer.class))).thenReturn(existing);

        customerService.registerOrUpdateCustomer(request);

        ArgumentCaptor<Customer> captor = ArgumentCaptor.forClass(Customer.class);
        verify(customerRepository).save(captor.capture());

        Customer savedCustomer = captor.getValue();
        assertEquals("new.email@test.com", savedCustomer.getEmail());
    }

    @Test
    @DisplayName("Upsert: Should CREATE NEW customer when not found")
    void registerOrUpdate_ShouldCreate_WhenNotFound() {
        CreateCustomerRequest request = buildRequest();

        when(customerRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(customerRepository.findByDocumentTypeAndDocumentNumber(any(), anyString()))
                .thenReturn(Optional.empty());

        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> {
            Customer c = i.getArgument(0);
            c.setId("new-id");
            return c;
        });

        CustomerResponse response = customerService.registerOrUpdateCustomer(request);

        assertNotNull(response.getId());
        assertEquals("new-id", response.getId());
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    @DisplayName("GetById: Should return customer when exists")
    void getCustomerById_ShouldReturn_WhenExists() {
        when(customerRepository.findById("cust-1")).thenReturn(Optional.of(buildCustomerEntity()));

        CustomerResponse response = customerService.getCustomerById("cust-1");

        assertEquals("Mario", response.getFirstName());
    }

    @Test
    @DisplayName("GetById: Should throw exception when not found")
    void getCustomerById_ShouldThrow_WhenNotFound() {
        when(customerRepository.findById("cust-1")).thenReturn(Optional.empty());

        assertThrows(CustomerNotFoundException.class, () -> customerService.getCustomerById("cust-1"));
    }

    @Test
    @DisplayName("Search: Should return list")
    void searchCustomers_ShouldReturnList() {
        when(customerRepository.search("Mario")).thenReturn(List.of(buildCustomerEntity()));

        var results = customerService.searchCustomers("Mario");

        assertEquals(1, results.size());
        assertEquals("Mario", results.get(0).getFirstName());
    }

    @Test
    @DisplayName("Snapshot: Should map CustomerResponse to Guest correctly")
    void createGuestSnapshot_ShouldMapCorrectly() {
        CustomerResponse customerResponse = CustomerResponse.builder()
                .id("cust-1")
                .firstName("Mario")
                .lastName("Rossi")
                .email("mario@test.com")
                .guestType(GuestType.ADULT)
                .build();

        Guest guest = customerService.createGuestSnapshot(customerResponse);

        assertEquals("cust-1", guest.getCustomerId());
        assertEquals("Mario", guest.getFirstName());
        assertEquals(GuestType.ADULT, guest.getGuestType());
    }

    private CreateCustomerRequest buildRequest() {
        return CreateCustomerRequest.builder()
                .firstName("Mario")
                .lastName("Rossi")
                .email("mario.rossi@test.com")
                .phone("+39333000000")
                .address("Via Roma 1")
                .birthDate(LocalDate.of(1990, 1, 1))
                .documentType(DocumentType.PASSPORT)
                .documentNumber("AB123")
                .guestType(GuestType.ADULT)
                .build();
    }

    private Customer buildCustomerEntity() {
        return Customer.builder()
                .id("cust-1")
                .firstName("Mario")
                .lastName("Rossi")
                .email("mario.rossi@test.com")
                .phone("+39333000000")
                .address("Via Roma 1")
                .birthDate(LocalDate.of(1990, 1, 1))
                .documentType(DocumentType.PASSPORT)
                .documentNumber("AB123")
                .guestType(GuestType.ADULT)
                .build();
    }
}