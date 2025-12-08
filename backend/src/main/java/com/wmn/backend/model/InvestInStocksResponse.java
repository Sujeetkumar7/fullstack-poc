package com.wmn.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestInStocksResponse {

    private String userId;
    private String transactionId;
    private String stockName;
    private Double pricePerUnit;
    private Integer quantity;
    private Double amount;
    private String transactionType;
    private String transactionDate;
    private Double currentBalance;
}
