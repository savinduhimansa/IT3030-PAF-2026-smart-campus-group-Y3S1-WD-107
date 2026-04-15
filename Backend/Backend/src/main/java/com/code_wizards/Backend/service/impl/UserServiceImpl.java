package com.code_wizards.Backend.service.impl;

import com.code_wizards.Backend.entity.User;
import com.code_wizards.Backend.repository.UserRepository;
import com.code_wizards.Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User registerUser(User user) {
        // Check if the email is already registered
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email is already in use!");
        }

        // Set default role to 'USER' if not provided
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }

        // Save the user to the database
        return userRepository.save(user);
    }

    @Override
    public User loginUser(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);

        // Check if user exists and password matches
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user.get();
        }

        throw new RuntimeException("Invalid email or password!");
    }

    @Override
    public User getUserById(Long id) {
        // Find the user by ID or throw an exception if not found
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));
    }

    @Override
    public User updateUser(Long id, User updatedUser) {
        // Find the existing user
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        // Update the basic details
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());

        // Only update the password if a new one is provided
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(updatedUser.getPassword());
        }

        // Only update the role if a new one is provided
        if (updatedUser.getRole() != null && !updatedUser.getRole().isEmpty()) {
            existingUser.setRole(updatedUser.getRole());
        }

        // Save and return the updated user
        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        // Find the user first to ensure they exist
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        // Delete the user from the database
        userRepository.delete(existingUser);
    }
}