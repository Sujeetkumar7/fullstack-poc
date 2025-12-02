package com.wmn.backend.service;

import com.wmn.backend.dto.TransferDto;
import com.wmn.backend.dto.UserResponseDto;
import com.wmn.backend.model.TransactionDto;
import com.wmn.backend.utils.CommonUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class TransactionService {
    private final DynamoDbClient dynamoDbClient;
    private final UserService userService;

    public TransactionService(DynamoDbClient dynamoDbClient, UserService userService) {
        this.dynamoDbClient = dynamoDbClient;
        this.userService = userService;
    }

    public List<TransactionDto> listTransactions(String userId) {
        ScanRequest req = ScanRequest.builder()
                .tableName(CommonUtils.TRANSACTION)
                .build();
        ScanResponse resp = dynamoDbClient.scan(req);
        if (resp == null || resp.items() == null) return Collections.emptyList();
        return resp.items().stream()
                .map(this::getItem)
                .filter(Objects::nonNull)
                .filter(t -> userId == null || userId.isEmpty() || userId.equals(t.getUserId()))
                .collect(Collectors.toList());
    }

    public Map<String, Object> createTransaction(TransferDto txn) {
        deductAmountFromSource(txn.getSourceUserId(),txn.getDestinationUserId(), txn.getAmount());
        Optional<Map<String, Object>> response = creditToDestinationUser(txn.getSourceUserId(),txn.getDestinationUserId(), txn.getAmount());
        return response.orElseThrow(() -> new IllegalArgumentException("Transaction failed"));
    }

    private Map<String, AttributeValue> putItem(TransactionDto t) {
        Map<String, AttributeValue> item = new HashMap<>();
        if (t.getTransactionId() != null) item.put("transaction_id", AttributeValue.builder().s(t.getTransactionId()).build());
        log.info("Transaction ID: " + t.getTransactionId());
        double signedAmount;
        String type = t.getTransactionType(); // expects "credit" or "debit"
        if (type != null) {
            if ("debit".equalsIgnoreCase(type)) {
                signedAmount = -Math.abs(t.getAmount());
            } else if ("credit".equalsIgnoreCase(type)) {
                signedAmount = Math.abs(t.getAmount());
            } else {
                signedAmount = t.getAmount();
            }
        } else {
            signedAmount = t.getAmount();
        }
        item.put("amount", AttributeValue.builder().n(Double.toString(signedAmount)).build());
        item.put("user_id", AttributeValue.builder().s(t.getUserId()).build());
        item.put("transaction_type", AttributeValue.builder().s(type).build());
        item.put("username", AttributeValue.builder().s(t.getUsername()).build());

        if (t.getTimestamp() != null) {
            item.put("timestamp", AttributeValue.builder().s(t.getTimestamp()).build());
        }
        return item;
    }

    private TransactionDto getItem(Map<String, AttributeValue> item) {
        if (item == null || item.isEmpty()) return null;
        TransactionDto t = new TransactionDto();
        if (item.containsKey("transaction_id") && item.get("transaction_id").s() != null) t.setTransactionId(item.get("transaction_id").s());
        if (item.containsKey("transaction_type") && item.get("transaction_type").s() != null) t.setTransactionType(item.get("transaction_type").s());
        if (item.containsKey("username") && item.get("username").s() != null) t.setUsername(item.get("username").s());
        if (item.containsKey("user_id") && item.get("user_id").s() != null) t.setUserId(item.get("user_id").s());
        if (item.containsKey("amount") && item.get("amount").n() != null) t.setAmount(Double.parseDouble(item.get("amount").n()));
        if (item.containsKey("timestamp") && item.get("timestamp").n() != null) t.setTimestamp(item.get("timestamp").n());
        return t;
    }

    private UserResponseDto deductAmountFromSource(String sourceUserId, String destinationUserId, double amount) {
        Optional<UserResponseDto> optUser = userService.getUserByUserId(sourceUserId);
        if (optUser.isEmpty()) {
            throw new IllegalArgumentException("Source user not found with userId: " + sourceUserId);
        }
        if(optUser.get().getCurrentBalance() < amount){
            throw new IllegalArgumentException("Insufficient Balance");
        }
        UserResponseDto updateUserDto = new UserResponseDto();
        updateUserDto.setUserId(sourceUserId);
        updateUserDto.setCurrentBalance(optUser.get().getCurrentBalance() - amount);
        userService.updateUserBalance(sourceUserId, updateUserDto.getCurrentBalance());
        addTransactionRecord(sourceUserId, optUser.get().getUsername(), "DEBIT", amount, destinationUserId);
        return updateUserDto;

    }

    private Optional<Map<String, Object>> creditToDestinationUser(String sourceUserId, String destinationUserId, double amount) {
        Optional<UserResponseDto> optUser = userService.getUserByUserId(destinationUserId);
        if (optUser.isEmpty()) {
            throw new IllegalArgumentException("Destination user not found with userId: " + destinationUserId);
        }
        UserResponseDto updateUserDto = new UserResponseDto();
        updateUserDto.setUserId(destinationUserId);
        updateUserDto.setCurrentBalance(optUser.get().getCurrentBalance() + amount);
        userService.updateUserBalance(destinationUserId, updateUserDto.getCurrentBalance());
        addTransactionRecord(sourceUserId, optUser.get().getUsername(), "CREDIT", amount, destinationUserId);

        return userService.getUserByUserId(sourceUserId).map(user -> {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Transaction success");
            response.put("sourceUserId", sourceUserId);
            response.put("sourceUsername", user.getUsername());
            response.put("destinationUserId", destinationUserId);
            response.put("destinationUsername", optUser.get().getUsername());
            return response;
        });

    }

    private TransactionDto addTransactionRecord(String sourceUserId, String username, String transactionType, double amount, String destinationuserId) {
        TransactionDto txn = new TransactionDto();
        txn.setTransactionId(RandomStringUtils.randomAlphanumeric(8));
        txn.setUserId(sourceUserId);
        txn.setUsername(username);
        txn.setTransactionType(transactionType);
        txn.setAmount(amount);
        txn.setDestinationuserId(destinationuserId);
        txn.setTimestamp(CommonUtils.getcurrentTimeStamp());

        PutItemRequest request = PutItemRequest.builder()
                .tableName(CommonUtils.TRANSACTION)
                .item(putItem(txn))
                .build();
        dynamoDbClient.putItem(request);

        return txn;
    }
}
