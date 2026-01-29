package com.swam.booking.repository;

import com.swam.booking.domain.Customer;
import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestType;
import com.swam.shared.enums.Sex;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataMongoTest
@Testcontainers
class CustomerRepositoryTest {
    @Container
    @ServiceConnection
    static MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:6.0");

    @Autowired
    private CustomerRepository customerRepository;

    @AfterEach
    void tearDown() {
        customerRepository.deleteAll();
    }

    private Customer mario;
    private Customer luigi;
    private Customer luciaCompanion;

    @BeforeEach
    void setUp() {
        // Main Guest con email
        mario = Customer.builder()
                .firstName("Mario")
                .lastName("Rossi")
                .email("mario.rossi@email.com")
                .phone("1234567890")
                .sex(Sex.M) // Mandatory
                .birthDate(LocalDate.of(1980, 1, 1))
                .documentType(DocumentType.ID_CARD)
                .documentNumber("DOC123")
                .guestType(GuestType.ADULT)
                .build();

        // Main Guest con email diversa
        luigi = Customer.builder()
                .firstName("Luigi")
                .lastName("Verdi")
                .email("luigi.verdi@test.it")
                .phone("1234567890")
                .sex(Sex.M)
                .birthDate(LocalDate.of(1985, 5, 20))
                .documentType(DocumentType.PASSPORT)
                .documentNumber("PASS456")
                .guestType(GuestType.ADULT)
                .build();

        // Companion (Senza Email)
        luciaCompanion = Customer.builder()
                .firstName("Lucia")
                .lastName("Bianchi")
                .email(null) // Light customer
                .sex(Sex.F)
                .birthDate(LocalDate.of(2015, 3, 10))
                .guestType(GuestType.CHILD)
                .build();

        customerRepository.saveAll(List.of(mario, luigi, luciaCompanion));
    }

    @Test
    @DisplayName("Check: findByEmail returns correct customer")
    void findByEmail_ShouldReturnCustomer() {
        Optional<Customer> found = customerRepository.findByEmail("mario.rossi@email.com");

        assertThat(found).isPresent();
        assertThat(found.get().getFirstName()).isEqualTo("Mario");
    }

    @Test
    @DisplayName("Check: findByFirstNameAndLastNameAndBirthDate finds Companion (Light Customer)")
    void findByFirstNameAndLastNameAndBirthDate_ShouldReturnCustomer() {
        // Questa query è fondamentale per evitare duplicati dei companions che non hanno email
        Optional<Customer> found = customerRepository.findByFirstNameAndLastNameAndBirthDate(
                "Lucia", "Bianchi", LocalDate.of(2015, 3, 10)
        );

        assertThat(found).isPresent();
        assertThat(found.get().getGuestType()).isEqualTo(GuestType.CHILD);
        assertThat(found.get().getEmail()).isNull();
    }

    @Test
    @DisplayName("Check: findByDocumentTypeAndDocumentNumber finds Customer")
    void findByDocumentTypeAndDocumentNumber_ShouldReturnCustomer() {
        Optional<Customer> found = customerRepository.findByDocumentTypeAndDocumentNumber(
                DocumentType.PASSPORT, "PASS456"
        );

        assertThat(found).isPresent();
        assertThat(found.get().getLastName()).isEqualTo("Verdi");
    }

    @Test
    @DisplayName("Check: findByPhone returns all customers with that phone")
    void findByPhone_ShouldReturnAllWithPhone() {
        List<Customer> results = customerRepository.findByPhone("1234567890");

        assertThat(results).hasSize(2); // Mario e Luigi hanno lo stesso telefono nel setup

        // check wrong phone number returns empty list
        List<Customer> wrong = customerRepository.findByPhone("0987654321");
        assertThat(wrong).isEmpty();
    }

    @Test
    @DisplayName("Check: search (custom query) works on Name OR Surname OR Email")
    void search_ShouldFindInAllFields() {
        // search by name "mario"
        List<Customer> byName = customerRepository.search("mario");
        assertThat(byName).hasSize(1);
        assertThat(byName.get(0).getLastName()).isEqualTo("Rossi");

        // search by surname "verdi"
        List<Customer> bySurname = customerRepository.search("verdi");
        assertThat(bySurname).hasSize(1);
        assertThat(bySurname.get(0).getFirstName()).isEqualTo("Luigi");

        // search by email domain "test.it"
        List<Customer> byEmail = customerRepository.search("luigi.verdi");
        assertThat(byEmail).hasSize(1);
        assertThat(byEmail.get(0).getFirstName()).isEqualTo("Luigi");

        // search non-existing term
        List<Customer> nothing = customerRepository.search("doesnotexist");
        assertThat(nothing).isEmpty();
    }
}