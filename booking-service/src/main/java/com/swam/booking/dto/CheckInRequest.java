package com.swam.booking.dto;

import com.swam.shared.enums.DocumentType;
import com.swam.shared.enums.GuestType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckInRequest {

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Il numero di telefono non è valido")
    private String phone;

    @NotBlank(message = "Indirizzo obbligatorio")
    private String address;

    @NotNull(message = "Data di nascita obbligatoria")
    @Past
    private LocalDate birthDate;

    @NotNull(message = "Tipo documento obbligatorio")
    private DocumentType documentType;

    @NotBlank(message = "Numero documento obbligatorio")
    private String documentNumber;

    @NotNull
    private GuestType guestType;

    private String country;

    @Valid
    private List<CompanionData> companions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanionData {
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
        @NotNull
        private LocalDate birthDate;
        @NotNull
        private GuestType guestType;

        //TODO: servono informazioni sui documenti dei companions?
    }
}