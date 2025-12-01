
package com.wmn.backend.controller;

//import com.wmn.backend.model.Transaction;
//import com.wmn.backend.model.TransferResponse;
//import com.wmn.backend.service.LambdaService;
//import com.wmn.backend.service.TransactionService;
import com.wmn.backend.model.TransactionDto;
import com.wmn.backend.service.DynamoDBTransactionService;
import com.wmn.backend.service.LambdaService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

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

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadAnalyticsReport() throws IOException {
        log.info("Download started.");
        byte[] fileData = transactionService.downloadAnalyticsReport();

        if (fileData != null && fileData.length > 0) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDisposition(ContentDisposition.parse("attachment; filename=Analytical_Report.csv"));
            headers.setContentLength(fileData.length);

            log.info("Download Ended.");
            return new ResponseEntity<>(fileData, headers, HttpStatus.OK);
        } else {
            log.info("No file found, returning 404.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header("X-Error-Message", "No file found in the specified S3 folder")
                    .build();
        }
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
