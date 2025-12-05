package com.wmn.backend.controller;


import com.wmn.backend.model.InvestInStocks;
import com.wmn.backend.model.InvestInStocksResponse;
import com.wmn.backend.model.TransactionDto;
import com.wmn.backend.service.StockMarketService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.annotations.NotNull;

@RestController
@RequestMapping("/stocks")
@CrossOrigin
@Slf4j
@Tag(name = "Stock Management", description = "APIs for managing stocks")
public class StockMarketController {

    StockMarketService stockMarketService;

    public StockMarketController(StockMarketService stockMarketService) {
        this.stockMarketService = stockMarketService;
    }

    @PostMapping("/invest")
    public ResponseEntity<InvestInStocksResponse> investInStocks(@NotNull @Valid @RequestBody InvestInStocks invest) {
        log.info("Investing in stocks...");
        return ResponseEntity.ok(stockMarketService.investInStocks(invest));
    }

}
