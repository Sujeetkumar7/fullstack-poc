package com.example.backend.controller;

import com.example.backend.model.Users;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/createUser")
    public ResponseEntity<String> createUser(@RequestBody Users users) {
        userService.createUser(users);
        return ResponseEntity.ok("User Created with user_Id: " + users.getUserId());
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable String id, @RequestBody Users updatedUser) {

        Users user = userService.updateUser(id, updatedUser);
        return ResponseEntity.ok("User with "+user.getUserId()+" updated successfully");
    }

    @GetMapping("/allUsers")
    public ResponseEntity<List<Users>> getAllUsers() {

       return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Deleted user with ID: " + id);
    }

}
