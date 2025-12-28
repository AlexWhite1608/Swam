package dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
// DTO for standardizing error responses across services
public class ErrorResponse {
    private String errorCode;
    private String errorMessage;
    private int status;
    private LocalDateTime timestamp;
    private String path;         // optional: which endpoint caused the error
}