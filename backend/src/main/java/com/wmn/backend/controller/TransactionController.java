package com.wmn.backend.controller;


import com.wmn.backend.service.LambdaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analyse")
public class TransactionController {

    @Autowired
    private LambdaService lambdaService;

    @GetMapping
    public ResponseEntity<String> triggerAnalytics() {
        String response = lambdaService.invokeLambda();
        return ResponseEntity.ok(response);
    }

    @GetMapping("download")
    public ResponseEntity<String> downloadAnalyticsReport() {
        String response = lambdaService.invokeLambda();
        return ResponseEntity.ok(response);
    }
}

