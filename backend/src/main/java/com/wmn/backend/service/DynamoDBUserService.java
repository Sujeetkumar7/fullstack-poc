package com.wmn.backend.service;

import com.wmn.backend.dto.UpdateUserDto;
import com.wmn.backend.dto.UserDto;
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

    //Auto-generate userId (U001, U002, ...)
    private String generateUserId() {
        ScanResponse scan = dynamoDbClient.scan(ScanRequest.builder().tableName(tableName).build());

        int max = scan.items().stream().map(i -> i.get("user_id")).filter(Objects::nonNull).map(AttributeValue::s).filter(id -> id.startsWith("U")).map(id -> Integer.parseInt(id.substring(1))).max(Integer::compareTo).orElse(0);

        return String.format("U%03d", max + 1);
    }


    // ------------------------------------------------

    //Auto-generate final username (john → john-1001…)
    private String generateFinalUsername(String base) {
        ScanResponse scan = dynamoDbClient.scan(ScanRequest.builder().tableName(tableName).build());

        int maxSuffix = scan.items().stream().map(i -> i.get("username")).filter(Objects::nonNull).map(AttributeValue::s).filter(u -> u.startsWith(base + "-")).map(u -> u.substring(u.lastIndexOf("-") + 1)).filter(num -> num.matches("\\d+")).map(Integer::parseInt).max(Integer::compareTo).orElse(1000); // start at 1001

        return base + "-" + (maxSuffix + 1);
    }

    //Create User

    public UserResponseDto createUser(UserDto dto) {
        String newUserId = generateUserId();
        String finalUsername = generateFinalUsername(dto.getUsername());

        Map<String, AttributeValue> item = new HashMap<>();
        item.put("user_id", AttributeValue.fromS(newUserId));
        item.put("username", AttributeValue.fromS(finalUsername));
        item.put("current_balance", AttributeValue.fromN("0.0"));
        item.put("user_role", AttributeValue.fromS("USER"));
        item.put("status", AttributeValue.fromS("ACTIVE"));
        dynamoDbClient.putItem(PutItemRequest.builder().tableName(tableName).item(item).build());

        return new UserResponseDto(newUserId, finalUsername, 0.0, "USER");
    }


    //Get User

    public Optional<UserResponseDto> getUser(String userId) {

        Map<String, AttributeValue> key = Map.of("user_id", AttributeValue.fromS(userId));

        GetItemRequest request = GetItemRequest.builder().tableName(tableName).key(key).consistentRead(true).build();

        Map<String, AttributeValue> item = dynamoDbClient.getItem(request).item();

        if (item == null || item.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(mapItemToResponse(item));
    }

    // UPDATE
    public UserResponseDto updateUser(String userId, UpdateUserDto dto) {

        Map<String, String> names = new HashMap<>();
        Map<String, AttributeValue> values = new HashMap<>();
        List<String> updates = new ArrayList<>();

        if (dto.getUsername() != null) {
            String newFinalUsername = generateFinalUsername(dto.getUsername());
            names.put("#username", "username");
            updates.add("#username = :username");
            values.put(":username", AttributeValue.fromS(newFinalUsername));
        }

        if (dto.getCurrentBalance() != null) {
            names.put("#current_balance", "current_balance");
            updates.add("#current_balance = :current_balance");
            values.put(":current_balance", AttributeValue.fromN(dto.getCurrentBalance().toString()));
        }

        if (dto.getUserRole() != null) {
            names.put("#user_role", "user_role");
            updates.add("#user_role = :user_role");
            values.put(":user_role", AttributeValue.fromS(dto.getUserRole()));
        }

        if (updates.isEmpty()) {
            throw new IllegalArgumentException("No fields to update");
        }

        UpdateItemResponse updated = dynamoDbClient.updateItem(UpdateItemRequest.builder().tableName(tableName).key(Map.of("user_id", AttributeValue.fromS(userId))).updateExpression("SET " + String.join(", ", updates)).expressionAttributeNames(names).expressionAttributeValues(values).returnValues(ReturnValue.ALL_NEW).build());

        return mapItemToResponse(updated.attributes());
    }

    //SOFT DELETE
    public Map<String, Object> deleteUser(String userId) {

        // Soft delete: set status = INACTIVE
        dynamoDbClient.updateItem(UpdateItemRequest.builder().tableName(tableName).key(Map.of("user_id", AttributeValue.fromS(userId))).updateExpression("SET #s = :inactive").expressionAttributeNames(Map.of("#s", "status")).expressionAttributeValues(Map.of(":inactive", AttributeValue.fromS("INACTIVE"))).build());

        // Return minimal response
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        response.put("userId", userId);

        return response;
    }

    //LIST USERS
    public List<UserResponseDto> listUsers() {
        ScanResponse scan = dynamoDbClient.scan(ScanRequest.builder().tableName(tableName).build());

        return scan.items().stream().map(this::mapItemToResponse).collect(Collectors.toList());
    }


    private UserResponseDto mapItemToResponse(Map<String, AttributeValue> item) {
        String userId = Optional.ofNullable(item.get("user_id")).map(AttributeValue::s).orElse(null);

        String username = Optional.ofNullable(item.get("username")).map(AttributeValue::s).orElse(null);

        Double currentBalance = Optional.ofNullable(item.get("current_balance")).map(AttributeValue::n).map(Double::valueOf).orElse(0.0);

        String userRole = Optional.ofNullable(item.get("user_role")).map(AttributeValue::s).orElse(null);

        return new UserResponseDto(userId, username, currentBalance, userRole);
    }
}