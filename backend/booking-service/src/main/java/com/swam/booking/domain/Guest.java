package com.swam.booking.domain;

import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestRole;
import com.swam.shared.enums.GuestType;
import com.swam.shared.enums.Sex;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.Id;

import java.time.LocalDate;

@Builder(toBuilder = true)
@Value
public class Guest {

    @Id
    String id;
    String customerId;

    @NotBlank
    String firstName;
    @NotBlank
    String lastName;

    @NotNull
    Sex sex;

    @Past
    LocalDate birthDate;

    String placeOfBirth;
    String citizenship; // iso code

    @Email
    String email;

    String phone;

    DocumentType documentType;
    String documentNumber;
    String documentPlaceOfIssue;

    @NotNull
    GuestType guestType; // ADULT, CHILD, INFANT

    @NotNull
    GuestRole guestRole; // HEAD_OF_FAMILY, MEMBER, HEAD_OF_GROUP

    @Min(1)
    Integer daysOfStay; // effective days of stay, used for city tax calculation

    @Builder.Default
    boolean taxExempt = false;

    String taxExemptReason;

    String notes;
}