package com.wmn.backend.service;

import com.wmn.backend.dto.UserResponseDto;
import com.wmn.backend.model.TransactionDto;
import com.wmn.backend.utils.CommonUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.S3Object;
import software.amazon.awssdk.utils.IoUtils;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class DynamoDBTransactionService {
    private final DynamoDbClient dynamoDbClient;
    private final String tableName = "transaction";
    private static final String BUCKET_NAME = "wmnanalytics";
    private static final String FOLDER_PREFIX = "analytics-output/";
    private static final Region REGION = Region.AP_SOUTH_2;

    @Autowired
    DynamoDBUserService userService;

    public DynamoDBTransactionService(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }

    public List<TransactionDto> listTransactions(String userId) {
        ScanRequest req = ScanRequest.builder()
                .tableName(tableName)
                .build();
        ScanResponse resp = dynamoDbClient.scan(req);
        if (resp == null || resp.items() == null) return Collections.emptyList();
        return resp.items().stream()
                .map(this::getItem)
                .filter(Objects::nonNull)
                .filter(t -> userId == null || userId.isEmpty() || userId.equals(t.getUserId()))
                .collect(Collectors.toList());
    }

    public TransactionDto createTransaction(TransactionDto txn) {
        if (txn == null) throw new IllegalArgumentException("transaction must not be null");
        if (txn.getTransactionId() == null || txn.getTransactionId().isEmpty()) {
            txn.setTransactionId(RandomStringUtils.randomAlphanumeric(8));
        }
        if (txn.getTimestamp() == null || txn.getTimestamp().isEmpty()) {
            txn.setTimestamp(CommonUtils.getcurrentTimeStamp());
        }

        // determine signed amount based on transaction type (credit = add, debit = subtract)
        double signedAmount = determineSignedAmount(txn);

        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(putItem(txn))
                .build();
        dynamoDbClient.putItem(request);

        // update user balance if userId present
        if (txn.getUserId() != null && !txn.getUserId().isEmpty()) {
            Optional<UserResponseDto> optUser = userService.getUser(txn.getUserId());
            double current = 0.0;
            if (optUser.isPresent() && optUser.get().getCurrentBalance() != null) {
                current = optUser.get().getCurrentBalance();
            }
            if(current < signedAmount * -1 && txn.getTransactionType().equalsIgnoreCase("debit")){
                throw new IllegalArgumentException("Insufficient Balance");
            }
            double newBalance = current + signedAmount;
            userService.updateUserBalance(txn.getUserId(), newBalance);
            txn.setAmount(newBalance);
        }

        return txn;
    }

    private double determineSignedAmount(TransactionDto t) {
        double amount = t.getAmount();
        String type = t.getTransactionType();
        if (type != null) {
            if ("debit".equalsIgnoreCase(type)) {
                return -Math.abs(amount);
            } else if ("credit".equalsIgnoreCase(type)) {
                return Math.abs(amount);
            }
        }
        return amount;
    }

    private Map<String, AttributeValue> putItem(TransactionDto t) {
        Map<String, AttributeValue> item = new HashMap<>();
        if (t.getTransactionId() != null) item.put("transaction_id", AttributeValue.builder().s(t.getTransactionId()).build());
log.info("Transaction ID: " + t.getTransactionId());
        // determine signed amount based on transaction type
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

        // timestamp is treated as string containing a numeric value (as expected by TransactionDto)
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

    public byte[] downloadAnalyticsReport() {
        String latestObjectKey = "";
        try {
            S3Client s3Client = S3Client.builder()
                    .region(Region.AP_SOUTH_2)
                    .build();

            List<S3Object> objectSummaries = CommonUtils.listFilesInFolder(s3Client, BUCKET_NAME, FOLDER_PREFIX);
            if (objectSummaries.isEmpty()) {
                log.info("No files found in the specified S3 folder.");
                return null; // No file found
            }

            Optional<S3Object> latestObjectOpt = objectSummaries.stream()
                    .filter(obj -> obj.size() > 0)
                    .max(Comparator.comparing(S3Object::lastModified));

            if (latestObjectOpt.isPresent()) {
                S3Object latestObject = latestObjectOpt.get();
                latestObjectKey = latestObject.key();

                log.info("Latest file identified: {} (Last Modified: {})", latestObjectKey, latestObject.lastModified());

                GetObjectRequest req = GetObjectRequest.builder()
                        .bucket(BUCKET_NAME)
                        .key(latestObjectKey)
                        .build();

                ResponseInputStream<GetObjectResponse> s3Stream = s3Client.getObject(req);
                byte[] data = IoUtils.toByteArray(s3Stream);

                log.info("Download complete. File size: {} bytes. File name {}", data.length, latestObjectKey);
                return data;
            }

        } catch (S3Exception e) {
            log.warn("S3 object not found or access denied: {}/{}", BUCKET_NAME, latestObjectKey, e);
            throw new RuntimeException("S3 object not found or access denied");
        } catch (Exception e) {
            log.error("Error retrieving S3 object {}/{}", BUCKET_NAME, latestObjectKey, e);
            throw new RuntimeException("Error retrieving S3 object");
        }
        return null;
    }





}
