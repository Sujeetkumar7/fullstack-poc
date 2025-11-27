package com.example.backend.model;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@ToString
@AllArgsConstructor
public class TransferResponse implements Serializable {

    String status;
    String transactionId;
}
