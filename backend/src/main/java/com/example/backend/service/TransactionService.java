package com.example.backend.service;

import com.example.backend.model.Transaction;
import com.example.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
