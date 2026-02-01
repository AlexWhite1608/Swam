package com.swam.booking.dto;

import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestRole;
import com.swam.shared.enums.GuestType;
import com.swam.shared.enums.Sex;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckInRequest {

    @Id
    private String customerId;

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
    private String citizenship; // ISO Code

    @Email
    private String email;

    private String phone;

    @NotNull
    private DocumentType documentType;

    @NotBlank
    private String documentNumber;

    private String documentPlaceOfIssue;

    @Valid
    private List<CompanionData> companions;

    @NotNull
    GuestType guestType;

    @NotNull
    GuestRole guestRole;

    private String notes; // refers to booking notes

    // reduced fields for companions
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompanionData {

        @Id
        private String customerId;

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

        @NotNull
        private GuestType guestType;

        @NotNull
        private GuestRole guestRole; // only used for check in data
    }
}