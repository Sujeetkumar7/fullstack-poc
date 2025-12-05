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
        Optional<UserResponseDto> sourceUserDetails = userService.getUserByUserId(txn.getSourceUserId());
        Optional<UserResponseDto> destinationUserDetails = userService.getUserByUserId(txn.getDestinationUserId());
        deductAmountFromSource(sourceUserDetails.get(),destinationUserDetails.get(), txn.getAmount());
        return creditToDestinationUser(sourceUserDetails.get(),destinationUserDetails.get(), txn.getAmount());
    }

    private Map<String, AttributeValue> putItem(TransactionDto t) {
        Map<String, AttributeValue> item = new HashMap<>();
        if (t.getTransactionId() != null) item.put("transaction_id", AttributeValue.builder().s(t.getTransactionId()).build());
        log.info("Transaction ID: " + t.getTransactionId());
        double signedAmount;
        String type = t.getTransactionType(); // expects "credit" or "debit"

        item.put("amount", AttributeValue.builder().n(Double.toString(t.getAmount())).build());
        item.put("user_id", AttributeValue.builder().s(t.getUserId()).build());
        item.put("transaction_type", AttributeValue.builder().s(type).build());
        item.put("from_username", AttributeValue.builder().s(t.getFromUsername()).build());
        item.put("to_username", AttributeValue.builder().s(t.getToUsername()).build());
        item.put("timestamp", AttributeValue.builder().s(t.getTimestamp()).build());

        return item;
    }

    private TransactionDto getItem(Map<String, AttributeValue> item) {
        if (item == null || item.isEmpty()) return null;
        TransactionDto t = new TransactionDto();
        if (item.containsKey("transaction_id") && item.get("transaction_id").s() != null) t.setTransactionId(item.get("transaction_id").s());
        if (item.containsKey("transaction_type") && item.get("transaction_type").s() != null) t.setTransactionType(item.get("transaction_type").s());
        if (item.containsKey("from_username") && item.get("from_username").s() != null) t.setFromUsername(item.get("from_username").s());
        if (item.containsKey("user_id") && item.get("user_id").s() != null) t.setUserId(item.get("user_id").s());
        if (item.containsKey("amount") && item.get("amount").n() != null) t.setAmount(Double.parseDouble(item.get("amount").n()));
        if (item.containsKey("timestamp") && item.get("timestamp").s() != null) t.setTimestamp(item.get("timestamp").s());
        if (item.containsKey("to_username") && item.get("to_username").s() != null) t.setToUsername(item.get("to_username").s());
        return t;
    }

    private UserResponseDto deductAmountFromSource(UserResponseDto sourceUserDetails, UserResponseDto destinationUserDetails, double amount) {
        String sourceUserId = sourceUserDetails.getUserId();
        if(sourceUserDetails.getCurrentBalance() < amount){
            throw new IllegalArgumentException("Insufficient Balance");
        }
        UserResponseDto updateUserDto = new UserResponseDto();
        updateUserDto.setUserId(sourceUserId);
        updateUserDto.setCurrentBalance(sourceUserDetails.getCurrentBalance() - amount);
        userService.updateUserBalance(sourceUserId, updateUserDto.getCurrentBalance());
        addTransactionRecord(sourceUserId, sourceUserDetails.getUsername(), "DEBIT", amount, destinationUserDetails.getUsername());
        return updateUserDto;

    }

    private Map<String, Object> creditToDestinationUser(UserResponseDto sourceUserDetails, UserResponseDto destinationUserDetails, double amount) {
        String destinationUserId = destinationUserDetails.getUserId();
        UserResponseDto updateUserDto = new UserResponseDto();
        updateUserDto.setUserId(destinationUserId);
        updateUserDto.setCurrentBalance(destinationUserDetails.getCurrentBalance() + amount);
        userService.updateUserBalance(destinationUserId, updateUserDto.getCurrentBalance());
        addTransactionRecord(destinationUserId, sourceUserDetails.getUsername(), "CREDIT", amount, destinationUserDetails.getUsername());


            Map<String, Object> response = new HashMap<>();
            response.put("message", "Transaction success");
            response.put("sourceUserId", sourceUserDetails.getUserId());
            response.put("sourceUsername", sourceUserDetails.getUsername());
            response.put("destinationUserId", destinationUserId);
            response.put("destinationUsername", destinationUserDetails.getUsername());
            return response;


    }

    public TransactionDto addTransactionRecord(String sourceUserId, String username, String transactionType, double amount, String destinationUserName) {
        TransactionDto txn = new TransactionDto();
        txn.setTransactionId(RandomStringUtils.randomAlphanumeric(8));
        txn.setUserId(sourceUserId);
        txn.setFromUsername(username);
        txn.setTransactionType(transactionType);
        txn.setAmount(amount);
        txn.setToUsername(destinationUserName);
        txn.setTimestamp(CommonUtils.getcurrentTimeStamp());

        PutItemRequest request = PutItemRequest.builder()
                .tableName(CommonUtils.TRANSACTION)
                .item(putItem(txn))
                .build();
        dynamoDbClient.putItem(request);

        return txn;
    }
}
