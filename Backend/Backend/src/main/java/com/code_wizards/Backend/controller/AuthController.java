package com.code_wizards.Backend.controller;

import com.code_wizards.Backend.entity.User;
import com.code_wizards.Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*") // Allow requests from React frontend
public class AuthController {

    @Autowired
    private UserService userService;

    // 1. Register Endpoint
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        User savedUser = userService.registerUser(user);
        return ResponseEntity.ok(savedUser);
    }

    // 2. Login Endpoint
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        User loggedInUser = userService.loginUser(user.getEmail(), user.getPassword());

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("id", loggedInUser.getId());
        responseData.put("email", loggedInUser.getEmail());
        responseData.put("role", loggedInUser.getRole());
        responseData.put("name", loggedInUser.getUsername());
        responseData.put("token", "auth-token-success");

        return ResponseEntity.ok(responseData);
    }

    // 3. Get User by ID Endpoint
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // 4. Get All Users Endpoint (For Admin Dashboard)
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // 5. Update User Endpoint
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    // 6. Delete User Endpoint
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully!");
    }

    // 7. Change Password Endpoint
    @PutMapping("/{id}/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@PathVariable Long id, @RequestBody Map<String, String> passwords) {
        Map<String, String> response = new HashMap<>();
        try {
            userService.changePassword(id, passwords.get("currentPassword"), passwords.get("newPassword"));
            response.put("message", "Password changed successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    // 8. Google Login Endpoint
    @PostMapping("/google")
    public ResponseEntity<Map<String, Object>> googleLogin(@RequestBody GoogleLoginRequest request) {
        User loggedInUser = userService.googleLogin(request.getEmail(), request.getName(), request.getGoogleId());

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("id", loggedInUser.getId());
        responseData.put("email", loggedInUser.getEmail());
        responseData.put("role", loggedInUser.getRole());
        responseData.put("name", loggedInUser.getUsername());
        responseData.put("token", "auth-token-success");

        return ResponseEntity.ok(responseData);
    }

    // ==========================================
    // NEW: 9. GitHub Login Endpoint (Member 4 Task)
    // ==========================================
    @PostMapping("/github")
    public ResponseEntity<Map<String, Object>> githubLogin(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");

        // Pass the code to the service layer to interact with GitHub API
        User loggedInUser = userService.githubLogin(code);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("id", loggedInUser.getId());
        responseData.put("email", loggedInUser.getEmail());
        responseData.put("role", loggedInUser.getRole());
        responseData.put("name", loggedInUser.getUsername());
        responseData.put("token", "auth-token-success"); // Dummy token for frontend validation

        return ResponseEntity.ok(responseData);
    }

    // DTO class for Google payload
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