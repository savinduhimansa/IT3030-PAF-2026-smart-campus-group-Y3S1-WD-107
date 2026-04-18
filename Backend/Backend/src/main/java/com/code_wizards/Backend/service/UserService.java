package com.code_wizards.Backend.service;

import com.code_wizards.Backend.entity.User;

public interface UserService {
    // Register a new user
    User registerUser(User user);

    // Authenticate user login
    User loginUser(String email, String password);

    // Get user details by ID
    User getUserById(Long id);

    // Update existing user details
    User updateUser(Long id, User updatedUser);

    // Delete a user
    void deleteUser(Long id);

    // Change user password
    void changePassword(Long userId, String currentPassword, String newPassword);
}