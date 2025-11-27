package com.wmn.backend.dto;

import jakarta.validation.constraints.*;

public class UserDto {
    @NotBlank
    private String userId;

    @NotBlank
    private String username;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true, message = "current_balance must be >= 0")
    private Double currentBalance;

    @NotBlank
    @Pattern(regexp = "ADMIN|USER", message = "user_role must be ADMIN or USER")
    private String userRole;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Double getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(Double currentBalance) { this.currentBalance = currentBalance; }
    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
}
