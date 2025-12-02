package com.wmn.backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class TransactionDto {
    private String transactionId;
    @NotBlank
    private String userId;
    @NotBlank
    private String destinationuserId;
    @NotBlank
    @Pattern(regexp = "DEBIT|CREDIT", message = "transactionType must be DEBIT OR CREDIT")
    private String transactionType;
    private Double amount;
    private String username;
    private String timestamp;

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getDestinationuserId() {
        return destinationuserId;
    }

    public void setDestinationuserId(String destinationuserId) {
        this.destinationuserId = destinationuserId;
    }
}
