package com.example.backend.service;

import com.example.backend.model.Users;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserService {

    public String createUser(Users users);
    public List<Users> getAllUsers();
    public Users updateUser(String id, Users updatedUser);
    public String deleteUser(String id);


}
