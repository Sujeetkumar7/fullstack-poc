package com.wmn.backend.dto;

import lombok.Data;

@Data
public class PortfolioStockDto {
    private String stockName;
    private double pricePerUnit;
    private int quantity;
    private double amount;
    private String transactionType;
    private String transactionDate;
}