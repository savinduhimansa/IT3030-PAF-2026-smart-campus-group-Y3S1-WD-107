package com.code_wizards.Backend.service;

import com.code_wizards.Backend.entity.User;
import java.util.List;

public interface UserService {
    // Register a new user (ADD)
    User registerUser(User user);

    // Authenticate user login
    User loginUser(String email, String password);

    // Get user details by ID
    User getUserById(Long id);

    // Get all users for Admin Dashboard
    List<User> getAllUsers();

    // Update existing user details including Role (UPDATE)
    User updateUser(Long id, User updatedUser);

    // Delete a user (DELETE)
    void deleteUser(Long id);

    // Change user password
    void changePassword(Long userId, String currentPassword, String newPassword);

    // Google Login
    User googleLogin(String email, String name, String googleId);

    // NEW: GitHub Login (Member 4 - OAuth Improvements)
    User githubLogin(String code);
}