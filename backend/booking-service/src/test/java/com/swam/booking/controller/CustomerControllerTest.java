package com.swam.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swam.booking.dto.CreateCustomerRequest;
import com.swam.booking.dto.CustomerResponse;
import com.swam.booking.service.CustomerService;
import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestRole;
import com.swam.shared.enums.GuestType;
import com.swam.shared.enums.Sex;
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
    @DisplayName("GET /api/customers/search -> get empty list when no query is provided")
    void searchCustomers_ShouldReturnEmpty_WhenQueryIsEmpty() throws Exception {
        mockMvc.perform(get("/api/customers/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));

        // service should not be called when query is empty
        verify(customerService, never()).searchCustomers(any());
    }

    @Test
    @DisplayName("POST /api/customers -> creates new customer and returns 201")
    void createCustomer_ShouldReturn201() throws Exception {
        CreateCustomerRequest request = CreateCustomerRequest.builder()
                .firstName("Luigi")
                .lastName("Verdi")
                .sex(Sex.M)
                .email("luigi@test.com")
                .birthDate(LocalDate.of(1990, 1, 1))
                .placeOfBirth("Milano")
                .citizenship("IT")
                .documentType(DocumentType.PASSPORT)
                .documentNumber("AB123")
                .guestType(GuestType.ADULT)
                .guestRole(GuestRole.HEAD_OF_FAMILY)
                .build();

        CustomerResponse response = CustomerResponse.builder()
                .id("cust-1")
                .firstName("Luigi")
                .email("luigi@test.com")
                .sex(Sex.M)
                .build();

        when(customerService.createCustomer(any(CreateCustomerRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("cust-1"))
                .andExpect(jsonPath("$.email").value("luigi@test.com"))
                .andExpect(jsonPath("$.sex").value("M"));
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