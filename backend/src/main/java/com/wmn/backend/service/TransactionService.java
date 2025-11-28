/*
package com.wmn.backend.service;

import com.wmn.backend.model.Transaction;
import com.wmn.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    public void save(Transaction txn) {
        repository.save(txn);
    }

    // New: expose repository query by userId
    public List<Transaction> findByUserId(String userId) {
        return repository.findAll().stream()
                .filter(txn -> userId.equals(txn.getUserId()))
                .toList();
    }
}
*/