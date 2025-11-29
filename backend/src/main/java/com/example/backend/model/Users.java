package com.example.backend.model;

//import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user")
@Data
public class Users {

    @Id
    private String userId;
    private String userName;
    private double currentBalance;
    private String userRole;//ADMIN, USER

}
