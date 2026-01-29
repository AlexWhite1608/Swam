package com.swam.booking.domain;

import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestType;
import com.swam.shared.enums.Sex;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "customers")
public class Customer {

    @Id
    private String id;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotNull
    private Sex sex;

    @NotNull
    @Past
    private LocalDate birthDate;

    private String placeOfBirth;
    private String citizenship;

    @Email
    private String email;

    private String phone;

    private DocumentType documentType;
    private String documentNumber;
    private String documentPlaceOfIssue;

    private GuestType guestType;
    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}