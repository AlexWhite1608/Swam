package com.swam.pricing.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Data
@Document(collection = "seasons")
public class Season {
    @Id
    private String id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
}