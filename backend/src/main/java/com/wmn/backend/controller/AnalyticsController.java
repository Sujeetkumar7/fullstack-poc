package com.wmn.backend.controller;

import com.wmn.backend.service.AnalyticsService;
import com.wmn.backend.service.LambdaService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@Slf4j
@CrossOrigin
public class AnalyticsController {

    private final LambdaService lambdaService;
    private final AnalyticsService analyticsService;

    public AnalyticsController(LambdaService lambdaService, AnalyticsService analyticsService){
        this.lambdaService = lambdaService;
        this.analyticsService = analyticsService;
    }

    @GetMapping("/start")
    public ResponseEntity<String> triggerAnalysis() {

        String response = lambdaService.invokeLambda();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> checkStatus(@RequestParam String jobId) {
        String status = analyticsService.getJobStatus(jobId);
        Map<String, String> response = new HashMap<>();
        response.put("jobId", jobId);
        response.put("status", status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadAnalyticsReport() throws IOException {
        log.info("Download started.");
        byte[] fileData = analyticsService.downloadAnalyticsReport();

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
}
