
package com.wmn.backend.dto;

public class UserResponseDto {
    private String userId;
    private String username;
    private Double currentBalance;
    private String userRole;

    public UserResponseDto() {}

    public UserResponseDto(String userId, String username, Double currentBalance, String userRole) {
        this.userId = userId;
        this.username = username;
        this.currentBalance = currentBalance;
        this.userRole = userRole;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Double getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(Double currentBalance) { this.currentBalance = currentBalance; }
    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
}
