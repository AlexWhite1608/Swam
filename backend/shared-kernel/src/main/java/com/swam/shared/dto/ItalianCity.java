package com.swam.shared.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ItalianCity {

    @JsonAlias("nome")
    private String name;

    @JsonAlias("codice")
    private String istatCode;

    @JsonAlias("sigla")
    private String province;

    @JsonAlias("codiceCatastale")
    private String cadastralCode;

    @JsonAlias("cap")
    private List<String> postalCodes;

    private Double latitude;
    private Double longitude;
}