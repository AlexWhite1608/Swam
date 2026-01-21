package com.swam.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swam.booking.dto.CreateCustomerRequest;
import com.swam.booking.dto.CustomerResponse;
import com.swam.booking.service.CustomerService;
import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CustomerController.class)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CustomerService customerService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/customers -> get all customers")
    void getAllCustomers_ShouldReturnList() throws Exception {
        CustomerResponse mockCustomer1 = CustomerResponse.builder().firstName("Mario").build();
        CustomerResponse mockCustomer2 = CustomerResponse.builder().firstName("Luigi").build();
        when(customerService.getAllCustomers()).thenReturn(List.of(mockCustomer1, mockCustomer2));

        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].firstName").value("Mario"))
                .andExpect(jsonPath("$[1].firstName").value("Luigi"));

        verify(customerService).getAllCustomers();
    }

    @Test
    @DisplayName("PUT /api/customers/{id} -> updates existing customer and returns 200")
    void updateCustomer_ShouldReturn200_WhenCustomerExists() throws Exception {
        String customerId = "cust-1";

        CreateCustomerRequest updateRequest = CreateCustomerRequest.builder()
                .firstName("Mario")
                .lastName("Rossi")
                .email("mario.rossi.updated@test.com")
                .phone("+393331234567")
                .address("Via Milano 15, Roma")
                .birthDate(LocalDate.of(1985, 5, 20))
                .documentType(DocumentType.ID_CARD)
                .documentNumber("IT123456")
                .guestType(GuestType.ADULT)
                .country("IT")
                .notes("Cliente aggiornato")
                .build();

        CustomerResponse updatedResponse = CustomerResponse.builder()
                .id(customerId)
                .firstName("Mario")
                .lastName("Rossi")
                .email("mario.rossi.updated@test.com")
                .phone("+393331234567")
                .address("Via Milano 15, Roma")
                .birthDate(LocalDate.of(1985, 5, 20))
                .documentType(DocumentType.ID_CARD)
                .documentNumber("IT123456")
                .guestType(GuestType.ADULT)
                .notes("Cliente aggiornato")
                .build();

        when(customerService.updateCustomer(eq(customerId), any(CreateCustomerRequest.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/customers/{id}", customerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(customerId))
                .andExpect(jsonPath("$.firstName").value("Mario"))
                .andExpect(jsonPath("$.lastName").value("Rossi"))
                .andExpect(jsonPath("$.email").value("mario.rossi.updated@test.com"))
                .andExpect(jsonPath("$.phone").value("+393331234567"))
                .andExpect(jsonPath("$.address").value("Via Milano 15, Roma"))
                .andExpect(jsonPath("$.documentType").value("ID_CARD"))
                .andExpect(jsonPath("$.documentNumber").value("IT123456"))
                .andExpect(jsonPath("$.notes").value("Cliente aggiornato"));

        verify(customerService).updateCustomer(eq(customerId), any(CreateCustomerRequest.class));
    }

    @Test
    @DisplayName("PUT /api/customers/{id} -> updates partial customer data")
    void updateCustomer_ShouldHandlePartialUpdate() throws Exception {
        String customerId = "cust-2";

        CreateCustomerRequest partialUpdateRequest = CreateCustomerRequest.builder()
                .firstName("Luigi")
                .lastName("Verdi")
                .email("luigi.verdi@test.com")
                .phone("+393339876543")
                .address("Via Nuova 1, Milano")
                .birthDate(LocalDate.of(1990, 8, 10))
                .documentType(DocumentType.PASSPORT)
                .documentNumber("AB789012")
                .guestType(GuestType.ADULT)
                .build();

        CustomerResponse updatedResponse = CustomerResponse.builder()
                .id(customerId)
                .firstName("Luigi")
                .lastName("Verdi")
                .email("luigi.verdi@test.com")
                .phone("+393339876543")
                .address("Via Nuova 1, Milano")
                .documentType(DocumentType.PASSPORT)
                .documentNumber("AB789012")
                .build();

        when(customerService.updateCustomer(eq(customerId), any(CreateCustomerRequest.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/customers/{id}", customerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(partialUpdateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(customerId))
                .andExpect(jsonPath("$.email").value("luigi.verdi@test.com"))
                .andExpect(jsonPath("$.documentNumber").value("AB789012"));

        verify(customerService).updateCustomer(eq(customerId), any(CreateCustomerRequest.class));
    }


    @Test
    @DisplayName("GET /api/customers/search -> get empty list when no query is provided")
    void searchCustomers_ShouldReturnEmpty_WhenQueryIsEmpty() throws Exception {
        mockMvc.perform(get("/api/customers/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));

        // service should not be called when query is empty
        verify(customerService, never()).searchCustomers(any());
    }

    @Test
    @DisplayName("GET /api/customers/search -> complex query with multiple matches")
    void searchCustomers_ShouldHandleComplexQuery_WithMultipleMatches() throws Exception {
        String searchQuery = "mario.rossi";

        CustomerResponse customer1 = CustomerResponse.builder()
                .id("cust-1")
                .firstName("Mario")
                .lastName("Rossi")
                .email("mario.rossi@gmail.com")
                .phone("+393331234567")
                .address("Via Roma 10, Milano")
                .birthDate(LocalDate.of(1985, 3, 15))
                .documentType(DocumentType.PASSPORT)
                .documentNumber("AB123456")
                .guestType(GuestType.ADULT)
                .build();

        CustomerResponse customer2 = CustomerResponse.builder()
                .id("cust-2")
                .firstName("Mario")
                .lastName("Rossi")
                .email("mario.rossi@company.it")
                .phone("+393339876543")
                .address("Via Verdi 5, Roma")
                .birthDate(LocalDate.of(1990, 7, 22))
                .documentType(DocumentType.ID_CARD)
                .documentNumber("IT987654")
                .guestType(GuestType.ADULT)
                .build();

        when(customerService.searchCustomers(searchQuery))
                .thenReturn(List.of(customer1, customer2));

        mockMvc.perform(get("/api/customers/search")
                        .param("query", searchQuery))
                .andExpect(status().isOk())
                // first customer
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].id").value("cust-1"))
                .andExpect(jsonPath("$[0].firstName").value("Mario"))
                .andExpect(jsonPath("$[0].lastName").value("Rossi"))
                .andExpect(jsonPath("$[0].email").value("mario.rossi@gmail.com"))
                .andExpect(jsonPath("$[0].documentType").value("PASSPORT"))

                // second customer
                .andExpect(jsonPath("$[1].id").value("cust-2"))
                .andExpect(jsonPath("$[1].email").value("mario.rossi@company.it"))
                .andExpect(jsonPath("$[1].documentType").value("ID_CARD"))
                .andExpect(jsonPath("$[1].address").value("Via Verdi 5, Roma"));

        verify(customerService).searchCustomers(searchQuery);
    }

    @Test
    @DisplayName("GET /api/customers/search -> complex query with special characters")
    void searchCustomers_ShouldHandleSpecialCharacters_InQuery() throws Exception {
        String complexQuery = "D'Angelo +39";

        CustomerResponse customer = CustomerResponse.builder()
                .id("cust-3")
                .firstName("Giuseppe")
                .lastName("D'Angelo")
                .email("giuseppe.dangelo@test.com")
                .phone("+393331112233")
                .guestType(GuestType.ADULT)
                .build();

        when(customerService.searchCustomers(complexQuery))
                .thenReturn(List.of(customer));

        mockMvc.perform(get("/api/customers/search")
                        .param("query", complexQuery))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].lastName").value("D'Angelo"))
                .andExpect(jsonPath("$[0].phone").value("+393331112233"));

        verify(customerService).searchCustomers(complexQuery);
    }

    @Test
    @DisplayName("POST /api/customers -> creates new customer and returns 201")
    void createCustomer_ShouldReturn201() throws Exception {
        CreateCustomerRequest request = CreateCustomerRequest.builder()
                .firstName("Luigi")
                .lastName("Verdi")
                .email("luigi@test.com")
                .address("Via Roma")
                .birthDate(LocalDate.of(1990, 1, 1))
                .documentType(DocumentType.PASSPORT)
                .documentNumber("AB123")
                .guestType(GuestType.ADULT)
                .build();

        CustomerResponse response = CustomerResponse.builder()
                .id("cust-1")
                .firstName("Luigi")
                .email("luigi@test.com")
                .build();

        when(customerService.createCustomer(any(CreateCustomerRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("cust-1"))
                .andExpect(jsonPath("$.email").value("luigi@test.com"));
    }

    @Test
    @DisplayName("GET /api/customers/{id} -> return customer by ID")
    void getCustomerById_ShouldReturnCustomer() throws Exception {
        String id = "cust-1";
        CustomerResponse response = CustomerResponse.builder().id(id).firstName("Test").build();
        when(customerService.getCustomerById(id)).thenReturn(response);

        mockMvc.perform(get("/api/customers/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Test"));
    }
}