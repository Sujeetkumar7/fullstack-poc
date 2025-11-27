package com.wmn.backend.service;

import com.wmn.backend.dto.UpdateUserDto;
import com.wmn.backend.dto.UserResponseDto;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DynamoDBUserService {

    private final DynamoDbClient dynamoDbClient;
    private final String tableName = "user";

    public DynamoDBUserService(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }

    public void createUser(com.wmn.backend.dto.UserDto dto) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("user_id", AttributeValue.builder().s(dto.getUserId()).build());
        item.put("username", AttributeValue.builder().s(dto.getUsername()).build());
        item.put("current_balance", AttributeValue.builder().n(dto.getCurrentBalance().toString()).build());
        item.put("user_role", AttributeValue.builder().s(dto.getUserRole()).build());

        PutItemRequest req = PutItemRequest.builder()
                .tableName(tableName)
                .item(item)
                .conditionExpression("attribute_not_exists(user_id)")
                .build();

        dynamoDbClient.putItem(req);
    }


    public Optional<UserResponseDto> getUser(String userId) {
        Map<String, AttributeValue> key = Map.of("user_id", AttributeValue.builder().s(userId).build());

        GetItemRequest request = GetItemRequest.builder()
                .tableName(tableName)
                .key(key)
                .consistentRead(true)
                .build();

        Map<String, AttributeValue> item = dynamoDbClient.getItem(request).item();
        if (item == null || item.isEmpty()) return Optional.empty();

        return Optional.of(mapItemToResponse(item));
    }

    // UPDATE (partial)
    public void updateUser(String userId, UpdateUserDto dto) {
        List<String> updates = new ArrayList<>();
        Map<String, String> names = new HashMap<>();
        Map<String, AttributeValue> values = new HashMap<>();

        if (dto.getUsername() != null) {
            names.put("#username", "username");
            updates.add("#username = :username");
            values.put(":username", AttributeValue.builder().s(dto.getUsername()).build());
        }
        if (dto.getCurrentBalance() != null) {
            names.put("#current_balance", "current_balance");
            updates.add("#current_balance = :current_balance");
            values.put(":current_balance", AttributeValue.builder().n(dto.getCurrentBalance().toString()).build());
        }
        if (dto.getUserRole() != null) {
            names.put("#user_role", "user_role");
            updates.add("#user_role = :user_role");
            values.put(":user_role", AttributeValue.builder().s(dto.getUserRole()).build());
        }

        if (updates.isEmpty()) {
            throw new IllegalArgumentException("No fields provided to update");
        }

        String updateExpr = "SET " + String.join(", ", updates);

        UpdateItemRequest request = UpdateItemRequest.builder()
                .tableName(tableName)
                .key(Map.of("user_id", AttributeValue.builder().s(userId).build()))
                .updateExpression(updateExpr)
                .expressionAttributeNames(names)
                .expressionAttributeValues(values)
                .conditionExpression("attribute_exists(user_id)")
                .returnValues(ReturnValue.ALL_NEW)
                .build();

        dynamoDbClient.updateItem(request);
    }

    public void deleteUser(String userId) {
        DeleteItemRequest request = DeleteItemRequest.builder()
                .tableName(tableName)
                .key(Map.of("user_id", AttributeValue.builder().s(userId).build()))
                .conditionExpression("attribute_exists(user_id)")
                .build();

        dynamoDbClient.deleteItem(request);
    }

    public List<UserResponseDto> listUsers(int pageSize, Map<String, AttributeValue> exclusiveStartKey) {
        ScanRequest.Builder builder = ScanRequest.builder()
                .tableName(tableName)
                .limit(pageSize);

        if (exclusiveStartKey != null && !exclusiveStartKey.isEmpty()) {
            builder.exclusiveStartKey(exclusiveStartKey);
        }

        ScanResponse resp = dynamoDbClient.scan(builder.build());
        return resp.items().stream().map(this::mapItemToResponse).collect(Collectors.toList());
    }

    private UserResponseDto mapItemToResponse(Map<String, AttributeValue> item) {
        String userId = item.getOrDefault("user_id", AttributeValue.builder().s("").build()).s();
        String username = item.getOrDefault("username", AttributeValue.builder().s("").build()).s();
        Double currentBalance = Optional.ofNullable(item.get("current_balance"))
                .map(AttributeValue::n)
                .map(Double::valueOf)
                .orElse(0.0);
        String userRole = item.getOrDefault("user_role", AttributeValue.builder().s("").build()).s();
        return new UserResponseDto(userId, username, currentBalance, userRole);
    }
}
