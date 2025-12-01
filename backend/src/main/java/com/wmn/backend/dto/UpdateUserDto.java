
package com.wmn.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;

public class UpdateUserDto {


    @DecimalMin(value = "0.0", inclusive = true, message = "current_balance must be >= 0")
    private Double currentBalance;

    @Pattern(regexp = "ADMIN|USER", message = "user_role must be ADMIN or USER")
    private String userRole;

    private String username;

    public Double getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(Double currentBalance) {
        this.currentBalance = currentBalance;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}