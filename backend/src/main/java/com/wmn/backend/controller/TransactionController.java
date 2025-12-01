
package com.wmn.backend.controller;

//import com.wmn.backend.model.Transaction;
//import com.wmn.backend.model.TransferResponse;
//import com.wmn.backend.service.LambdaService;
//import com.wmn.backend.service.TransactionService;
import com.wmn.backend.model.TransactionDto;
import com.wmn.backend.service.DynamoDBTransactionService;
import com.wmn.backend.service.LambdaService;
import com.wmn.backend.utils.CommonUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transaction")
@Slf4j
@CrossOrigin
public class TransactionController {
    @Autowired
    private DynamoDBTransactionService transactionService;
    @Autowired
    private LambdaService lambdaService;

    @GetMapping("/analytics")
    public ResponseEntity<String> triggerAnalysis() {
        String response = lambdaService.invokeLambda();
        return ResponseEntity.ok(response);
    }

    @GetMapping("download")
    public ResponseEntity<?> downloadAnalyticsReport() {
        return ResponseEntity.ok(transactionService.downloadAnalyticsReport());
    }

    // GET /transaction/history/{user_id}
    @GetMapping("/history")
    public ResponseEntity<List<TransactionDto>> listTransactions(@RequestParam String userId) {
        List<TransactionDto> list = transactionService.listTransactions(userId);
        return ResponseEntity.ok(list);
    }

    // POST /transaction/transfer
    @PostMapping("/transfer")
    public ResponseEntity<TransactionDto> createTransaction(@RequestBody TransactionDto txn) {
        TransactionDto created = transactionService.createTransaction(txn);
        return ResponseEntity.ok().body(created);
    }

}
