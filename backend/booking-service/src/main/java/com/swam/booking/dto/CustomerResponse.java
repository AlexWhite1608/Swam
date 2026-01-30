package com.swam.booking.dto;

import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestType;
import com.swam.shared.enums.Sex;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class CustomerResponse {
    private String id;

    private String firstName;
    private String lastName;
    private Sex sex;

    private String email;
    private String phone;

    private LocalDate birthDate;
    private String placeOfBirth;
    private String citizenship;

    private String documentNumber;
    private DocumentType documentType;
    private String documentPlaceOfIssue;

    private GuestType guestType;
}