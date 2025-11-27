package com.example.backend.repository;

import org.springframework.stereotype.Repository;

@Repository
public class TransactionDao {

    /*private final DynamoDbTable<Transaction> table;

    public TransactionDao(DynamoDbEnhancedClient enhancedClient) {
        this.table = enhancedClient.table("Transactions", TableSchema.fromClass(Transaction.class));
    }

    public void save(Transaction txn) {
        table.putItem(txn);
    }

    public Optional<Transaction> findByTransactionId(String transactionId) {
        Transaction result = table.getItem(r -> r.key(k -> k.partitionValue(transactionId)));
        return Optional.ofNullable(result);
    }

    *//**
     * Query transactions by userId using GSI 'UserIdIndex' which should have partition key 'user_id'.
     *//*
    public List<Transaction> findByUserId(String userId) {
        // Build a query conditional on the userId attribute
        QueryConditional conditional = QueryConditional.keyEqualTo(k -> k.partitionValue(userId));

        List<Transaction> results = new ArrayList<>();

        // Iterate pages returned by the query and collect items
        var pages = table.index("UserIdIndex").query(r -> r.queryConditional(conditional));
        for (var page : pages) {
            for (Transaction t : page.items()) {
                results.add(t);
            }
        }

        return results;
    }*/
}
