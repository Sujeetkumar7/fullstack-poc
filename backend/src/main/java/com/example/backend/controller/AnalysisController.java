package com.example.backend.controller;


import com.example.backend.service.LambdaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analyse")
public class AnalysisController {

    @Autowired
    private LambdaService lambdaService;

    @GetMapping("/{userId}")
    public ResponseEntity<String> triggerAnalysis(@PathVariable String userId) {
        String response = lambdaService.invokeLambda(userId);
        return ResponseEntity.ok(response);
    }
}

