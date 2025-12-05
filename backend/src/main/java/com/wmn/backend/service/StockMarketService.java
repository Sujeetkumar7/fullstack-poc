package com.wmn.backend.service;

import com.wmn.backend.dto.UserResponseDto;
import com.wmn.backend.model.InvestInStocks;
import com.wmn.backend.model.InvestInStocksResponse;
import com.wmn.backend.model.TransactionDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@Slf4j
public class StockMarketService {
    private final DynamoDbClient dynamoDbClient;
    private final UserService userService;
    private final TransactionService transactService;

    public StockMarketService(DynamoDbClient dynamoDbClient, UserService userService, TransactionService transactService) {
        this.dynamoDbClient = dynamoDbClient;
        this.userService = userService;
        this.transactService = transactService;
    }

    public InvestInStocksResponse investInStocks(InvestInStocks invest) {
        if (invest == null || invest.getUserId() == null) {
            throw new IllegalArgumentException("Invalid input: invest or userId is null");
        }
        if (invest.getQuantity() <= 0 || invest.getPricePerUnit() <= 0) {
            throw new IllegalArgumentException("Quantity and pricePerUnit must be positive");
        }
        if (invest.getTransactionType() == null || invest.getTransactionType().isBlank()) {
            throw new IllegalArgumentException("Transaction type is required");
        }

        Optional<UserResponseDto> sourceUserDetails = userService.getUserByUserId(invest.getUserId());
        UserResponseDto user = sourceUserDetails.orElseThrow(() ->
                new IllegalArgumentException("User not found: " + invest.getUserId()));

        BigDecimal quantity = BigDecimal.valueOf(invest.getQuantity());
        BigDecimal pricePerUnit = BigDecimal.valueOf(invest.getPricePerUnit());
        BigDecimal amount = quantity.multiply(pricePerUnit);

        String type = invest.getTransactionType().trim().toUpperCase();

        if ("BUY".equals(type)) type = "DEBIT";
        else if ("SELL".equals(type)) type = "CREDIT";

        BigDecimal currentBalance = BigDecimal.valueOf(user.getCurrentBalance());

        BigDecimal updatedBalance;
        switch (type) {
            case "DEBIT":
                if (currentBalance.compareTo(amount) < 0) {
                    throw new IllegalArgumentException("Insufficient balance");
                }
                updatedBalance = currentBalance.subtract(amount);
                break;
            case "CREDIT":

                updatedBalance = currentBalance.add(amount);
                break;

            default:
                throw new IllegalArgumentException("Unsupported transaction type: " + invest.getTransactionType());
        }

        userService.updateUserBalance(user.getUserId(), updatedBalance.doubleValue());
        InvestInStocksResponse response = new InvestInStocksResponse();
        TransactionDto txn =  transactService.addTransactionRecord(
                user.getUserId(),
                user.getUsername(),
                type,
                amount.doubleValue(),
                "Stock Market"
        );
        response.setCurrentBalance(updatedBalance.doubleValue());
        response.setStockName(invest.getStockName());
        response.setQuantity(invest.getQuantity());
        response.setAmount(txn.getAmount());
        response.setTransactionDate(txn.getTimestamp());
        response.setTransactionType(txn.getTransactionType());
        response.setUserId(txn.getUserId());
        response.setTransactionId(txn.getTransactionId());
        response.setPricePerUnit(invest.getPricePerUnit());
        return response;
    }

}
