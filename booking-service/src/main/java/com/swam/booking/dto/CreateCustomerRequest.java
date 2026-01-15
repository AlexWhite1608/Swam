package com.swam.booking.dto;

import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCustomerRequest {

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(min = 2, max = 50)
    private String firstName;

    @NotBlank(message = "Il cognome è obbligatorio")
    @Size(min = 2, max = 50)
    private String lastName;

    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "L'email deve essere valida")
    private String email;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Il numero di telefono non è valido")
    private String phone;

    @NotBlank(message = "L'indirizzo è obbligatorio")
    private String address;

    @NotNull(message = "La data di nascita è obbligatoria")
    @Past(message = "La data di nascita deve essere nel passato")
    private LocalDate birthDate;

    @NotBlank(message = "Il numero del documento è obbligatorio")
    private String documentNumber;

    @NotNull(message = "Il tipo di documento è obbligatorio")
    private DocumentType documentType;

    @NotNull(message = "Il tipo di ospite è obbligatorio")
    private GuestType guestType;

    private String notes;
}