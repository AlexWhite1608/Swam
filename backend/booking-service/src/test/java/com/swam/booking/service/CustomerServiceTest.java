package com.swam.booking.service;

import com.swam.booking.domain.Customer;
import com.swam.booking.domain.Guest;
import com.swam.booking.dto.CheckInRequest;
import com.swam.booking.dto.CreateCustomerRequest;
import com.swam.booking.dto.CustomerResponse;
import com.swam.booking.repository.CustomerRepository;
import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestRole;
import com.swam.shared.enums.GuestType;
import com.swam.shared.enums.Sex;
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
    @DisplayName("Upsert: Should CREATE NEW customer when not found")
    void registerOrUpdate_ShouldCreate_WhenNotFound() {
        CreateCustomerRequest request = buildRequest();

        // Mock repository returning empty for checks
        when(customerRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(customerRepository.findByDocumentTypeAndDocumentNumber(any(), anyString()))
                .thenReturn(Optional.empty());

        // Mock save returning object with ID
        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> {
            Customer c = i.getArgument(0);
            c.setId("new-id");
            c.setSex(Sex.M); // Ensure mapping
            return c;
        });

        CustomerResponse response = customerService.registerOrUpdateCustomer(request);

        assertNotNull(response.getId());
        assertEquals("new-id", response.getId());
        assertEquals(Sex.M, response.getSex());

        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    @DisplayName("Upsert: Should UPDATE existing customer found by Email")
    void registerOrUpdate_ShouldUpdate_WhenFoundByEmail() {
        CreateCustomerRequest request = buildRequest();
        request.setPhone("+39999999999"); // Changed field

        Customer existing = buildCustomerEntity();

        when(customerRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(existing));
        // Note: findById might not be called in optimized implementation, but if it is:
        // when(customerRepository.findById(anyString())).thenReturn(Optional.of(existing));

        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArgument(0));

        CustomerResponse response = customerService.registerOrUpdateCustomer(request);

        // Verify update
        assertEquals("+39999999999", response.getPhone());
        assertNotNull(response.getId());

        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    @DisplayName("Companion: Should CREATE 'Light' Customer for Companion when not exists")
    void registerOrUpdateCompanion_ShouldCreate_WhenNotExists() {
        CheckInRequest.CompanionData companionData = CheckInRequest.CompanionData.builder()
                .firstName("Lucia")
                .lastName("Bianchi")
                .birthDate(LocalDate.of(1995, 5, 5))
                .sex(Sex.F)
                .guestType(GuestType.ADULT)
                .guestRole(GuestRole.MEMBER)
                .citizenship("IT")
                .placeOfBirth("Milano")
                .build();

        when(customerRepository.findByFirstNameAndLastNameAndBirthDate(anyString(), anyString(), any()))
                .thenReturn(Optional.empty());

        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> {
            Customer c = i.getArgument(0);
            c.setId("comp-1");
            return c;
        });

        CustomerResponse response = customerService.registerOrUpdateCompanion(companionData);

        assertNotNull(response);
        assertEquals("comp-1", response.getId());
        assertEquals("Lucia", response.getFirstName());
        assertEquals("IT", response.getCitizenship());
        // Verify email is null for light customer
        assertNull(response.getEmail());
    }

    @Test
    @DisplayName("Companion: Should UPDATE existing Companion")
    void registerOrUpdateCompanion_ShouldUpdate_WhenExists() {
        CheckInRequest.CompanionData companionData = CheckInRequest.CompanionData.builder()
                .firstName("Lucia")
                .lastName("Bianchi")
                .birthDate(LocalDate.of(1995, 5, 5))
                .sex(Sex.F)
                .guestType(GuestType.ADULT)
                .guestRole(GuestRole.MEMBER)
                .citizenship("FR") // Changed citizenship
                .build();

        Customer existing = Customer.builder()
                .id("comp-1")
                .firstName("Lucia")
                .lastName("Bianchi")
                .birthDate(LocalDate.of(1995, 5, 5))
                .citizenship("IT")
                .build();

        when(customerRepository.findByFirstNameAndLastNameAndBirthDate(anyString(), anyString(), any()))
                .thenReturn(Optional.of(existing));

        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArgument(0));

        CustomerResponse response = customerService.registerOrUpdateCompanion(companionData);

        assertEquals("FR", response.getCitizenship());
        assertEquals("comp-1", response.getId());
    }

    @Test
    @DisplayName("Snapshot: Should map CustomerResponse to Guest correctly with Role")
    void createGuestSnapshot_ShouldMapCorrectly() {
        CustomerResponse customerResponse = CustomerResponse.builder()
                .id("cust-1")
                .firstName("Mario")
                .lastName("Rossi")
                .email("mario@test.com")
                .sex(Sex.M)
                .citizenship("IT")
                .guestType(GuestType.ADULT)
                .build();

        // Pass specific role (e.g. HEAD_OF_FAMILY)
        Guest guest = customerService.createGuestSnapshot(customerResponse, GuestRole.HEAD_OF_FAMILY);

        assertEquals("cust-1", guest.getCustomerId());
        assertEquals("Mario", guest.getFirstName());
        assertEquals(Sex.M, guest.getSex());
        assertEquals("IT", guest.getCitizenship());
        assertEquals(GuestRole.HEAD_OF_FAMILY, guest.getGuestRole()); // Verify injected role
    }

    @Test
    @DisplayName("GetById: Should return customer when exists")
    void getCustomerById_ShouldReturn_WhenExists() {
        when(customerRepository.findById("cust-1")).thenReturn(Optional.of(buildCustomerEntity()));

        CustomerResponse response = customerService.getCustomerById("cust-1");

        assertEquals("Mario", response.getFirstName());
    }

    @Test
    @DisplayName("Search: Should return list")
    void searchCustomers_ShouldReturnList() {
        when(customerRepository.search("Mario")).thenReturn(List.of(buildCustomerEntity()));

        var results = customerService.searchCustomers("Mario");

        assertEquals(1, results.size());
        assertEquals("Mario", results.get(0).getFirstName());
    }

    private CreateCustomerRequest buildRequest() {
        return CreateCustomerRequest.builder()
                .firstName("Mario")
                .lastName("Rossi")
                .email("mario.rossi@test.com")
                .phone("+39333000000")
                .birthDate(LocalDate.of(1990, 1, 1))
                .sex(Sex.M)
                .placeOfBirth("Milano")
                .citizenship("IT")
                .documentType(DocumentType.PASSPORT)
                .documentNumber("AB123")
                .guestType(GuestType.ADULT)
                .guestRole(GuestRole.HEAD_OF_FAMILY)
                .build();
    }

    private Customer buildCustomerEntity() {
        return Customer.builder()
                .id("cust-1")
                .firstName("Mario")
                .lastName("Rossi")
                .email("mario.rossi@test.com")
                .phone("+39333000000")
                .birthDate(LocalDate.of(1990, 1, 1))
                .sex(Sex.M)
                .citizenship("IT")
                .documentType(DocumentType.PASSPORT)
                .documentNumber("AB123")
                .guestType(GuestType.ADULT)
                .build();
    }
}