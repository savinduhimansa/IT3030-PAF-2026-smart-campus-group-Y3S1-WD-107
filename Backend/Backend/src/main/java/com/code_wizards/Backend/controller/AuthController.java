package com.code_wizards.Backend.controller;

import com.code_wizards.Backend.entity.User;
import com.code_wizards.Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*") // Allow requests from React frontend
public class AuthController {

    @Autowired
    private UserService userService;

    // 1. Register Endpoint (Save a new user)
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        User savedUser = userService.registerUser(user);
        return ResponseEntity.ok(savedUser);
    }

    // 2. Login Endpoint (Authenticate user)
    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User user) {
        User loggedInUser = userService.loginUser(user.getEmail(), user.getPassword());
        return ResponseEntity.ok(loggedInUser);
    }

    // 3. Get User by ID Endpoint (Retrieve user details)
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // 4. Update User Endpoint (Modify existing user details)
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    // 5. Delete User Endpoint (Remove a user from the database)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully!");
    }
}