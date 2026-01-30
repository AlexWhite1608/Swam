package com.swam.booking.domain;

import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestRole;
import com.swam.shared.enums.GuestType;
import com.swam.shared.enums.Sex;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.Id;

import java.time.LocalDate;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class Guest {

    @Id
    private String id;

    private String customerId;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private Sex sex;

    private LocalDate birthDate;

    private String placeOfBirth;

    private String citizenship; // iso code

    @Email
    private String email;

    private String phone;

    private DocumentType documentType;

    private String documentNumber;

    private String documentPlaceOfIssue;

    private GuestType guestType; // ADULT, CHILD, INFANT

    private GuestRole guestRole; // HEAD_OF_FAMILY, MEMBER, HEAD_OF_GROUP

    @Min(1)
    private Integer daysOfStay; // effective days of stay, used for city tax calculation

    @Builder.Default
    private boolean taxExempt = false;

    private String taxExemptReason;
}