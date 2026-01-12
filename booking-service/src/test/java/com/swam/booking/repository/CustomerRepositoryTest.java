package com.swam.booking.repository;

import com.swam.booking.domain.Customer;
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

    @BeforeEach
    void setUp() {
        mario = Customer.builder()
                .firstName("Mario")
                .lastName("Rossi")
                .email("mario.rossi@email.com")
                .phone("1234567890")
                .build();

        luigi = Customer.builder()
                .firstName("Luigi")
                .lastName("Verdi")
                .email("luigi.verdi@test.it")
                .phone("1234567890")
                .build();

        customerRepository.saveAll(List.of(mario, luigi));
    }

    @Test
    @DisplayName("Check: findByEmail returns correct customer")
    void findByEmail_ShouldReturnCustomer() {
        Optional<Customer> found = customerRepository.findByEmail("mario.rossi@email.com");

        assertThat(found).isPresent();
        assertThat(found.get().getFirstName()).isEqualTo("Mario");
    }

    @Test
    @DisplayName("Check: findByPhone returns all customers with that phone")
    void findByPhone_ShouldReturnAllWithPhone() {
        List<Customer> results = customerRepository.findByPhone("1234567890");

        assertThat(results).hasSize(2);

        // check wrong phone number returns empty list
        List<Customer> wrong = customerRepository.findByPhone("0987654321");
        assertThat(wrong).isEmpty();
    }

    @Test
    @DisplayName("Check: findByFirstName...And... ignores case and matches exact")
    void findByFirstAndLast_ShouldMatchExactAndIgnoreCase() {
        // Test Case Insensitive (mArIo, rOsSi)
        List<Customer> results = customerRepository.findByFirstNameIgnoreCaseAndLastNameIgnoreCase(
                "mArIo", "rOsSi"
        );

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getEmail()).isEqualTo("mario.rossi@email.com");

        // Test Wrong Data
        List<Customer> wrong = customerRepository.findByFirstNameIgnoreCaseAndLastNameIgnoreCase(
                "Mario", "Verdi"
        );
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

    @Test
    @DisplayName("Check: search handles partial matches (Regex)")
    void search_ShouldHandlePartialMatches() {
        // "Ros" should match "Rossi"
        List<Customer> results = customerRepository.search("Ros");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getLastName()).isEqualTo("Rossi");
    }
}