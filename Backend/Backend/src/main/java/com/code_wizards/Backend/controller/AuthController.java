package com.code_wizards.Backend.controller;

import com.code_wizards.Backend.entity.User;
import com.code_wizards.Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List; // ADDED: Import for List
import java.util.Map;

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

    // 2. Login Endpoint (Authenticate user and return formatted data for React frontend)
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        User loggedInUser = userService.loginUser(user.getEmail(), user.getPassword());

        // Create a response map to match the exact JSON structure expected by the frontend
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("id", loggedInUser.getId());
        responseData.put("email", loggedInUser.getEmail());
        responseData.put("role", loggedInUser.getRole());

        // This is the fixed line: Using getUsername() based on the User entity
        responseData.put("name", loggedInUser.getUsername());

        responseData.put("token", "auth-token-success"); // Dummy token for frontend validation

        return ResponseEntity.ok(responseData);
    }

    // 3. Get User by ID Endpoint (Retrieve user details)
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // ==========================================
    // NEW: 8. Get All Users Endpoint (For Admin Dashboard)
    // ==========================================
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        // Fetch all users to display in the User Management table
        return ResponseEntity.ok(userService.getAllUsers());
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

    // ==========================================
    // 6. Change Password Endpoint
    // ==========================================
    @PutMapping("/{id}/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@PathVariable Long id, @RequestBody Map<String, String> passwords) {
        Map<String, String> response = new HashMap<>();
        try {
            System.out.println("Attempting password change for User ID: " + id);
            // Call the service method to change the password
            userService.changePassword(id, passwords.get("currentPassword"), passwords.get("newPassword"));

            response.put("message", "Password changed successfully!");
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            System.out.println("Password Change Failed: " + e.getMessage());
            // Send the exact error message back to React
            response.put("error", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    // ==========================================
    // 7. Google Login Endpoint
    // ==========================================
    @PostMapping("/google")
    public ResponseEntity<Map<String, Object>> googleLogin(@RequestBody GoogleLoginRequest request) {
        // Authenticate or register the user via Google details
        User loggedInUser = userService.googleLogin(request.getEmail(), request.getName(), request.getGoogleId());

        // Create a response map to match the exact JSON structure expected by the frontend
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("id", loggedInUser.getId());
        responseData.put("email", loggedInUser.getEmail());
        responseData.put("role", loggedInUser.getRole());
        responseData.put("name", loggedInUser.getUsername());
        responseData.put("token", "auth-token-success"); // Dummy token for frontend validation

        return ResponseEntity.ok(responseData);
    }

    // DTO (Data Transfer Object) inner class to capture Google Login payload from React
    public static class GoogleLoginRequest {
        private String email;
        private String name;
        private String googleId;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getGoogleId() { return googleId; }
        public void setGoogleId(String googleId) { this.googleId = googleId; }
    }
}