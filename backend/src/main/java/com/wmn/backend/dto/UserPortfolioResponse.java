package com.wmn.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserPortfolioResponse {
    private String userId;
    private String username;
    private String userRole;
    private double currentBalance;
    private List<PortfolioStockDto> stocks;
}