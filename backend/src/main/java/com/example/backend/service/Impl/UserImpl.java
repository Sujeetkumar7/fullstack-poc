package com.example.backend.service.Impl;

import com.example.backend.model.Users;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    public UserImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String createUser(Users users) {
        userRepository.save(users);
        return "User Created";
    }

    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    public Users updateUser(String id, Users updatedUser) {
        Users existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        existing.setUserId(updatedUser.getUserId());
        existing.setUserName(updatedUser.getUserName());
        existing.setUserRole(updatedUser.getUserRole());

        return userRepository.save(existing);
    }

    public String deleteUser(String id) {
        userRepository.deleteById(id);
        return "User Deleted";
    }
}
