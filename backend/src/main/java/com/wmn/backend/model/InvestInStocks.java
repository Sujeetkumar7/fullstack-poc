package com.wmn.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestInStocks {

    private String transactionId;
    private String userId;
    private String securitySymbol;
    private Integer quantity;
    private Double pricePerUnit;
    private String transactionType; // BUY or SELL
    private String transactionDate;
}
