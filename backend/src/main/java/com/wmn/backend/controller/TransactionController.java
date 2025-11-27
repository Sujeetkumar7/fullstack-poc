package com.wmn.backend.controller;

import com.wmn.backend.model.Transaction;
import com.wmn.backend.model.TransferResponse;
import com.wmn.backend.service.LambdaService;
import com.wmn.backend.service.TransactionService;
import com.wmn.backend.utils.CommonUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transaction")
@Slf4j
public class TransactionController {
    @Autowired
    private TransactionService transactionService;
    @Autowired
    private LambdaService lambdaService;

    @GetMapping("/analytics")
    public ResponseEntity<String> triggerAnalysis() {
        String response = lambdaService.invokeLambda();
        return ResponseEntity.ok(response);
    }

    @GetMapping("download")
    public ResponseEntity<String> downloadAnalyticsReport() {
        String response = lambdaService.invokeLambda();
        return ResponseEntity.ok(response);
    }

    // POST /transaction/transfer
    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestBody Transaction txn) {
        txn.setTimestamp(CommonUtils.getcurrentTimeStamp());
        transactionService.save(txn);
        log.info("Transaction saved successfully with transaction ID :: {}", txn.getTransactionId());
        return ResponseEntity.ok(new TransferResponse("saved", txn.getTransactionId()));
    }

    // GET /transaction/history/{user_id}
    @GetMapping("/history/{user_id}")
    public ResponseEntity<List<Transaction>> history(@PathVariable("user_id") String userId) {
        List<Transaction> txns = transactionService.findByUserId(userId);
        return ResponseEntity.ok(txns);
    }

    // GET /transaction/analysis/{user_id}
    @GetMapping("/summery/{user_id}")
    public ResponseEntity<?> analysis(@PathVariable("user_id") String userId) {
        List<Transaction> txns = transactionService.findByUserId(userId);

        double totalCredit = txns.stream()
                .filter(t -> "credit".equalsIgnoreCase(t.getTransactionType()))
                .mapToDouble(t -> t.getAmount() == null ? 0.0 : t.getAmount())
                .sum();

        double totalDebit = txns.stream()
                .filter(t -> "debit".equalsIgnoreCase(t.getTransactionType()))
                .mapToDouble(t -> t.getAmount() == null ? 0.0 : t.getAmount())
                .sum();

        long count = txns.size();
        double balance = totalCredit - totalDebit;

        Map<String, Object> summary = Map.of(
                "userId", userId,
                "count", count,
                "totalCredit", totalCredit,
                "totalDebit", totalDebit,
                "balance", balance
        );

        return ResponseEntity.ok(summary);
    }

}
