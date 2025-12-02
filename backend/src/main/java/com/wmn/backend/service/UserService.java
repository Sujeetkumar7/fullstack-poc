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
public class UserService {

    private final DynamoDbClient dynamoDbClient;
    private final String tableName = "user";

    public UserService(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }

    private String generateUserId() {
        ScanResponse scan = dynamoDbClient.scan(ScanRequest.builder().tableName(tableName).build());

        int max = scan.items().stream().map(i -> i.get("user_id")).filter(Objects::nonNull).map(AttributeValue::s).filter(id -> id.startsWith("U")).map(id -> Integer.parseInt(id.substring(1))).max(Integer::compareTo).orElse(0);

        return String.format("U%03d", max + 1);
    }

    private String generateFinalUsername(String base) {
        ScanResponse scan = dynamoDbClient.scan(ScanRequest.builder().tableName(tableName).build());

        int maxSuffix = scan.items().stream().map(i -> i.get("username")).filter(Objects::nonNull).map(AttributeValue::s).filter(u -> u.startsWith(base + "-")).map(u -> u.substring(u.lastIndexOf("-") + 1)).filter(num -> num.matches("\\d+")).map(Integer::parseInt).max(Integer::compareTo).orElse(1000); // start at 1001

        return base + "-" + (maxSuffix + 1);
    }

    private String normalizeRole(String role) {
        if (role == null) return null;

        role = role.trim().toUpperCase();

        if (role.equals("USER") || role.equals("ADMIN")) {
            return role;
        }

        return "USER";
    }

    public UserResponseDto createUser(UserDto dto) {
        String newUserId = generateUserId();
        String finalUsername = generateFinalUsername(dto.getUsername());

        String role = normalizeRole(dto.getUserRole());
        if (role == null) {
            role = "USER";
        }

        Map<String, AttributeValue> item = new HashMap<>();
        item.put("user_id", AttributeValue.fromS(newUserId));
        item.put("username", AttributeValue.fromS(finalUsername));
        item.put("current_balance", AttributeValue.fromN("0.0"));
        item.put("user_role", AttributeValue.fromS(role));
        item.put("status", AttributeValue.fromS("ACTIVE"));

        dynamoDbClient.putItem(
                PutItemRequest.builder()
                        .tableName(tableName)
                        .item(item)
                        .build()
        );

        return new UserResponseDto(newUserId, finalUsername, 0.0, role);
    }

    public Optional<UserResponseDto> getUser(String username) {

        ScanRequest request = ScanRequest.builder()
                .tableName(tableName)
                .filterExpression("username = :u")
                .expressionAttributeValues(Map.of(
                        ":u", AttributeValue.builder().s(username).build()
                ))
                .build();

        ScanResponse response = dynamoDbClient.scan(request);

        if (response.count() == 0) {
            return Optional.empty();
        }

        Map<String, AttributeValue> item = response.items().get(0);

        AttributeValue statusAttr = item.get("status");
        if (statusAttr != null && statusAttr.s() != null) {
            if ("inactive".equalsIgnoreCase(statusAttr.s())) {
                throw new RuntimeException("User not found");
            }
        }

        return Optional.of(mapItemToResponse(item));
    }

    public UserResponseDto updateUser(String userId, UpdateUserDto dto) {

        Map<String, String> names = new HashMap<>();
        Map<String, AttributeValue> values = new HashMap<>();
        List<String> updates = new ArrayList<>();

        if (dto.getUsername() != null) {
            names.put("#username", "username");
            updates.add("#username = :username");
            values.put(":username", AttributeValue.fromS(dto.getUsername()));
        }

        if (dto.getCurrentBalance() != null) {
            names.put("#current_balance", "current_balance");
            updates.add("#current_balance = :current_balance");
            values.put(":current_balance", AttributeValue.fromN(dto.getCurrentBalance().toString()));
        }

        if (dto.getUserRole() != null) {
            String normalizedRole = normalizeRole(dto.getUserRole());
            names.put("#user_role", "user_role");
            updates.add("#user_role = :user_role");
            values.put(":user_role", AttributeValue.fromS(normalizedRole));
        }

        if (updates.isEmpty()) {
            throw new IllegalArgumentException("No fields to update");
        }

        UpdateItemResponse updated = dynamoDbClient.updateItem(UpdateItemRequest.builder().tableName(tableName).key(Map.of("user_id", AttributeValue.fromS(userId))).updateExpression("SET " + String.join(", ", updates)).expressionAttributeNames(names).expressionAttributeValues(values).returnValues(ReturnValue.ALL_NEW).build());

        return mapItemToResponse(updated.attributes());
    }

    public Map<String, Object> deleteUser(String userId) {

        dynamoDbClient.updateItem(UpdateItemRequest.builder().tableName(tableName).key(Map.of("user_id", AttributeValue.fromS(userId))).updateExpression("SET #s = :inactive").expressionAttributeNames(Map.of("#s", "status")).expressionAttributeValues(Map.of(":inactive", AttributeValue.fromS("INACTIVE"))).build());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        response.put("userId", userId);

        return response;
    }

    public List<UserResponseDto> listUsers(String status) {

        ScanResponse scan = dynamoDbClient.scan(
                ScanRequest.builder().tableName(tableName).build()
        );

        return scan.items().stream()
                .filter(item -> {
                    String itemStatus = item.containsKey("status") ? item.get("status").s() : null;

                    return !("inactive".equalsIgnoreCase(itemStatus));
                })
                .map(this::mapItemToResponse)
                .collect(Collectors.toList());
    }

    private UserResponseDto mapItemToResponse(Map<String, AttributeValue> item) {
        String userId = Optional.ofNullable(item.get("user_id")).map(AttributeValue::s).orElse(null);

        String username = Optional.ofNullable(item.get("username")).map(AttributeValue::s).orElse(null);

        Double currentBalance = Optional.ofNullable(item.get("current_balance")).map(AttributeValue::n).map(Double::valueOf).orElse(0.0);

        String userRole = Optional.ofNullable(item.get("user_role")).map(AttributeValue::s).orElse(null);

        return new UserResponseDto(userId, username, currentBalance, userRole);
    }

    public void updateUserBalance(String userId, double newBalance) {
        Map<String, AttributeValue> key = Collections.singletonMap("userId", AttributeValue.builder().s(userId).build());
        Map<String, AttributeValue> exprVals = Collections.singletonMap(":current_balance", AttributeValue.builder().n(Double.toString(newBalance)).build());

        UpdateItemRequest req = UpdateItemRequest.builder()
                .tableName(tableName)
                .key(Map.of("user_id", AttributeValue.builder().s(userId).build()))
                .updateExpression("SET current_balance = :current_balance")
                .expressionAttributeValues(exprVals)
                .build();

        dynamoDbClient.updateItem(req);
    }

    public Optional<UserResponseDto> getUserByUserId(String userId) {

        ScanRequest request = ScanRequest.builder()
                .tableName(tableName)
                .filterExpression("user_id = :u")
                .expressionAttributeValues(Map.of(
                        ":u", AttributeValue.builder().s(userId).build()
                ))
                .build();

        ScanResponse response = dynamoDbClient.scan(request);

        if (response.count() == 0) {
            return Optional.empty();
        }

        Map<String, AttributeValue> item = response.items().get(0);

        AttributeValue statusAttr = item.get("status");
        if (statusAttr != null && statusAttr.s() != null) {
            if ("inactive".equalsIgnoreCase(statusAttr.s())) {
                throw new RuntimeException("User not found");
            }
        }

        return Optional.of(mapItemToResponse(item));
    }
}