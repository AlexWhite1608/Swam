package com.swam.booking.dto;

import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestRole;
import com.swam.shared.enums.GuestType;
import com.swam.shared.enums.Sex;
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

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotNull
    private Sex sex;

    @Email
    private String email;

    private String phone;

    @NotNull
    @Past
    private LocalDate birthDate;

    private String placeOfBirth;

    private String provinceOfBirth;

    private String citizenship;


    private String documentNumber;
    private DocumentType documentType;
    private String documentPlaceOfIssue;

    @NotNull
    private GuestType guestType;

    @NotNull
    private GuestRole guestRole;

    private String notes;
}