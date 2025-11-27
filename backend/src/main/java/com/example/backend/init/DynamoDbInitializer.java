package com.example.backend.init;

import org.springframework.stereotype.Component;

@Component
public class DynamoDbInitializer {/*

    private static final Logger log = LoggerFactory.getLogger(DynamoDbInitializer.class);

    private final DynamoDbClient dynamoDbClient;

    public DynamoDbInitializer(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void ensureTables() {
        String tableName = "Transactions";
        try {
            dynamoDbClient.describeTable(DescribeTableRequest.builder().tableName(tableName).build());
            log.info("DynamoDB table '{}' already exists", tableName);
        } catch (ResourceNotFoundException e) {
            log.info("DynamoDB table '{}' not found, creating...", tableName);

            CreateTableRequest createTableRequest = CreateTableRequest.builder()
                    .tableName(tableName)
                    .attributeDefinitions(
                            AttributeDefinition.builder().attributeName("transaction_id").attributeType(ScalarAttributeType.S).build(),
                            AttributeDefinition.builder().attributeName("user_id").attributeType(ScalarAttributeType.S).build()
                    )
                    .keySchema(
                            KeySchemaElement.builder().attributeName("transaction_id").keyType(KeyType.HASH).build()
                    )
                    // Define a GSI on user_id
                    .globalSecondaryIndexes(
                            GlobalSecondaryIndex.builder()
                                    .indexName("UserIdIndex")
                                    .keySchema(KeySchemaElement.builder().attributeName("user_id").keyType(KeyType.HASH).build())
                                    .projection(Projection.builder().projectionType(ProjectionType.ALL).build())
                                    .build()
                    )
                    .billingMode(BillingMode.PAY_PER_REQUEST)
                    .build();

            dynamoDbClient.createTable(createTableRequest);

            // Wait until table exists
            try {
                WaiterResponse<DescribeTableResponse> waiterResponse = dynamoDbClient.waiter().waitUntilTableExists(DescribeTableRequest.builder().tableName(tableName).build());
                waiterResponse.matched().response().ifPresent(r -> log.info("Table '{}' is now active", tableName));
            } catch (Exception ex) {
                log.warn("Timed out waiting for table to become active: {}", ex.getMessage());
            }
        } catch (DynamoDbException ex) {
            log.error("Error checking/creating DynamoDB table: {}", ex.getMessage(), ex);
        }
    }*/
}
