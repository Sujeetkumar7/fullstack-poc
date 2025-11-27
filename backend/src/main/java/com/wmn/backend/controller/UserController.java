
package com.wmn.backend.controller;

import com.wmn.backend.dto.UpdateUserDto;
import com.wmn.backend.dto.UserDto;
import com.wmn.backend.dto.UserResponseDto;
import com.wmn.backend.service.DynamoDBUserService;
import jakarta.validation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {

    private final DynamoDBUserService userService;

    public UserController(DynamoDBUserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<String> create(@Valid @RequestBody UserDto dto) {
        userService.createUser(dto);
        return ResponseEntity.ok("User created: " + dto.getUserId());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> read(@PathVariable String userId) {
        Optional<UserResponseDto> user = userService.getUser(userId);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}")
    public ResponseEntity<String> update(@PathVariable String userId,
                                         @Valid @RequestBody UpdateUserDto dto) {
        userService.updateUser(userId, dto);
        return ResponseEntity.ok("User updated: " + userId);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> delete(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok("User deleted: " + userId);
    }
}
