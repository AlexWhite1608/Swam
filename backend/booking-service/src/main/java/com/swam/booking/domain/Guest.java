package com.swam.booking.domain;

import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestType;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.Id;

import java.time.LocalDate;
import java.time.Period;

@Builder(toBuilder = true)
@Value
public class Guest {

    @Id
    String id;

    // reference to customer id in customers collection
    String customerId;

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(min = 2, max = 50, message = "Il nome deve essere tra 2 e 50 caratteri")
    String firstName;

    @NotBlank(message = "Il cognome è obbligatorio")
    @Size(min = 2, max = 50, message = "Il cognome deve essere tra 2 e 50 caratteri")
    String lastName;

    @Email(message = "L'email non è valida")
    String email;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Il numero di telefono non è valido")
    String phone;

    @NotBlank(message = "L'indirizzo è obbligatorio")
    String address;

    @NotNull(message = "La data di nascita è obbligatoria")
    @Past(message = "La data di nascita deve essere valida")
    LocalDate birthDate;

    DocumentType documentType;

    String documentNumber;

    @NotNull(message = "Il tipo di ospite è obbligatorio")
    GuestType guestType;

    String notes;

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public Integer getAge() {
        if (birthDate == null) {
            return null;
        }
        return Period.between(birthDate, LocalDate.now()).getYears();
    }
}