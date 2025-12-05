package com.wmn.backend.service;

import com.wmn.backend.dto.UserResponseDto;
import com.wmn.backend.model.InvestInStocks;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.util.Optional;

@Service
@Slf4j
public class StockMarketService {
    private final DynamoDbClient dynamoDbClient;
    private final UserService userService;
    private final TransactionService transacService;

    public StockMarketService(DynamoDbClient dynamoDbClient, UserService userService, TransactionService transacService) {
        this.dynamoDbClient = dynamoDbClient;
        this.userService = userService;
        this.transacService = transacService;
    }
   public String investInStocks(InvestInStocks invest) {
       Optional<UserResponseDto> sourceUserDetails = userService.getUserByUserId(invest.getUserId());
       if(sourceUserDetails.get().getCurrentBalance() < (invest.getQuantity()*invest.getPricePerUnit())){
           throw new IllegalArgumentException("Insufficient Balance");
       }

       deductAmountFromUser(sourceUserDetails.get(), invest.getQuantity()*invest.getPricePerUnit(), invest.getTransactionId());


return null;
   }

    private void deductAmountFromUser(UserResponseDto userResponseDto, double v, String transactionId) {
        double updatedBalance = userResponseDto.getCurrentBalance() - v;
        userService.updateUserBalance(userResponseDto.getUserId(), updatedBalance);
        transacService.addTransactionRecord(userResponseDto.getUserId(), userResponseDto.getUsername(), "DEBIT - Bought Shares", v, "Transaction ID: "+transactionId);

    }
}
