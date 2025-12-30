package com.swam.shared.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ErrorResponse {
    private String errorCode;
    private String errorMessage;
    private int status;
    private LocalDateTime timestamp;
    private String path;         // optional: which endpoint caused the error
}