package com.wmn.backend.service;

import com.wmn.backend.dto.PortfolioStockDto;
import com.wmn.backend.dto.UserPortfolioResponse;
import com.wmn.backend.dto.UserResponseDto;
import com.wmn.backend.model.InvestInStocks;
import com.wmn.backend.model.InvestInStocksResponse;
import com.wmn.backend.model.TransactionDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

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

        TransactionDto txn = transactService.addTransactionRecord(
                user.getUserId(),
                user.getUsername(),
                type,
                amount.doubleValue(),
                "Stock Market"
        );
        long now = System.currentTimeMillis();
        savePortfolioTransaction(invest, type, now);

        InvestInStocksResponse response = new InvestInStocksResponse();
        response.setCurrentBalance(updatedBalance.doubleValue());
        response.setStockName(invest.getStockName());
        response.setQuantity(invest.getQuantity());
        response.setAmount(txn.getAmount());
        response.setTransactionDate(txn.getTimestamp());
        response.setTransactionType(txn.getTransactionType());
        response.setUserId(txn.getUserId());
        response.setPricePerUnit(invest.getPricePerUnit());
        response.setTransactionId(txn.getTransactionId());

        return response;
    }

    public UserPortfolioResponse getUserPortfolio(String userId) {

        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId is required");
        }

        UserResponseDto user = userService.getUserByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        ScanRequest req = ScanRequest.builder()
                .tableName("Portfolio_Transaction")
                .build();

        ScanResponse resp = dynamoDbClient.scan(req);

        Map<String, PortfolioStockDto> portfolioMap = new HashMap<>();

        if (resp != null && resp.items() != null) {

            for (Map<String, AttributeValue> item : resp.items()) {

                if (item.get("userId") == null || item.get("userId").s() == null)
                    continue;

                if (!userId.equals(item.get("userId").s()))
                    continue;

                if (item.get("stockName") == null || item.get("stockName").s() == null)
                    continue;

                String stockName = item.get("stockName").s();

                String qtyStr = (item.get("quantity") != null && item.get("quantity").n() != null)
                        ? item.get("quantity").n()
                        : "0";

                String priceStr = (item.get("pricePerUnit") != null && item.get("pricePerUnit").n() != null)
                        ? item.get("pricePerUnit").n()
                        : "0";

                String txnType = (item.get("transactionType") != null && item.get("transactionType").s() != null)
                        ? item.get("transactionType").s()
                        : "UNKNOWN";

                String tsStr = (item.get("timestamp") != null && item.get("timestamp").n() != null)
                        ? item.get("timestamp").n()
                        : "0";

                int qty = Integer.parseInt(qtyStr);
                double price = Double.parseDouble(priceStr);
                long timestamp = Long.parseLong(tsStr);

                PortfolioStockDto stock = portfolioMap.getOrDefault(stockName, new PortfolioStockDto());
                stock.setStockName(stockName);
                stock.setPricePerUnit(price);

                int currentQty = stock.getQuantity();

                if ("DEBIT".equalsIgnoreCase(txnType)) {
                    currentQty += qty;
                } else if ("CREDIT".equalsIgnoreCase(txnType)) {
                    currentQty -= qty;
                }

                stock.setQuantity(currentQty);

                stock.setAmount(stock.getAmount() + (qty * price));

                if (timestamp > 0) {
                    stock.setTransactionDate(String.valueOf(timestamp));
                    stock.setTransactionType(txnType);
                }

                portfolioMap.put(stockName, stock);
            }
        }

        List<PortfolioStockDto> finalList = portfolioMap.values().stream()
                .filter(s -> s.getQuantity() > 0)
                .toList();

        UserPortfolioResponse response = new UserPortfolioResponse();
        response.setUserId(user.getUserId());
        response.setUserRole(user.getUserRole());
        response.setCurrentBalance(user.getCurrentBalance());
        response.setStocks(finalList);

        return response;
    }


    private void savePortfolioTransaction(InvestInStocks invest, String txnType, long timestamp) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("transaction_id", AttributeValue.builder().s(UUID.randomUUID().toString()).build());
        item.put("userId", AttributeValue.builder().s(invest.getUserId()).build());
        item.put("stockName", AttributeValue.builder().s(invest.getStockName()).build());
        item.put("pricePerUnit", AttributeValue.builder().n(String.valueOf(invest.getPricePerUnit())).build());
        item.put("quantity", AttributeValue.builder().n(String.valueOf(invest.getQuantity())).build());
        item.put("transactionType", AttributeValue.builder().s(txnType).build());
        item.put("timestamp", AttributeValue.builder().n(String.valueOf(timestamp)).build());

        dynamoDbClient.putItem(b -> b
                .tableName("Portfolio_Transaction")
                .item(item)
        );
    }

}