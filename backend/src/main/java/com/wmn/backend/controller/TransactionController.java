
package com.wmn.backend.controller;

import com.wmn.backend.dto.TransferDto;
import com.wmn.backend.model.TransactionDto;
import com.wmn.backend.service.TransactionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transaction")
@CrossOrigin
@Tag(name = "Transaction Management", description = "APIs for money transfer and transaction history")
public class TransactionController {
    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService){
        this.transactionService = transactionService;
    }

    @GetMapping("/history")
    public ResponseEntity<List<TransactionDto>> listTransactions(@RequestParam String userId) {
        List<TransactionDto> list = transactionService.listTransactions(userId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> createTransaction(@RequestBody TransferDto txn) {
        return ResponseEntity.ok(transactionService.createTransaction(txn));
    }

}
