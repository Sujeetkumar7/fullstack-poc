package com.wmn.backend.controller;

import com.wmn.backend.dto.UpdateUserDto;
import com.wmn.backend.dto.UserDto;
import com.wmn.backend.dto.UserResponseDto;
import com.wmn.backend.service.DynamoDBUserService;
import jakarta.validation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@CrossOrigin
public class UserController {

    @Autowired
    private final DynamoDBUserService userService;

    public UserController(DynamoDBUserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> create(@Valid @RequestBody UserDto dto) {

        UserResponseDto created = userService.createUser(dto);

        Map<String, String> response = new HashMap<>();
        response.put("userId", created.getUserId());
        response.put("username", created.getUsername());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserResponseDto> read(@PathVariable String username) {
        return userService.getUser(username).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Map<String, String>> update(@PathVariable String userId, @RequestBody UpdateUserDto dto) {

        userService.updateUser(userId, dto);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User updated successfully");
        response.put("userId", userId);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable String userId) {
        return ResponseEntity.ok(userService.deleteUser(userId));
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> listUsers(
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(userService.listUsers(status));
    }
}