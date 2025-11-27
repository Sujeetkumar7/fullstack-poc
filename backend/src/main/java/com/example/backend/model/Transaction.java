package com.example.backend.model;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

//@DynamoDbBean
@Document("Transaction")
@Data
public class Transaction {
    @MongoId
    private String transactionId; // PK -> attribute "transaction_id"
    private String userId;        // FK -> attribute "user_id"
    private String transactionType; // -> attribute "transaction_type"
    private Double amount;        // -> attribute "amount"
    private String username;      // -> attribute "username"
    private String timestamp;       // -> attribute "timestamp" (epoch millis)


}
