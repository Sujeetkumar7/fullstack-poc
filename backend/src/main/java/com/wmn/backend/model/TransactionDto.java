package com.wmn.backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {
    private String transactionId;
    @NotBlank
    private String userId;
    @NotBlank
    @Pattern(regexp = "DEBIT|CREDIT", message = "transactionType must be DEBIT OR CREDIT")
    private String transactionType;
    private Double amount;
    private String fromUsername;
    private String toUsername;
    private String timestamp;
}
