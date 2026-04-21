package com.code_wizards.Backend.service.impl;

import com.code_wizards.Backend.entity.User;
import com.code_wizards.Backend.repository.UserRepository;
import com.code_wizards.Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpMethod;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User registerUser(User user) {
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email is already in use!");
        }
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        return userRepository.save(user);
    }

    @Override
    public User loginUser(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user.get();
        }
        throw new RuntimeException("Invalid email or password!");
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User updateUser(Long id, User updatedUser) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(updatedUser.getPassword());
        }

        if (updatedUser.getRole() != null && !updatedUser.getRole().isEmpty()) {
            existingUser.setRole(updatedUser.getRole());
        }

        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        userRepository.delete(existingUser);
    }

    @Override
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (user.getPassword().equals(currentPassword)) {
            user.setPassword(newPassword);
            userRepository.save(user);
        } else {
            throw new RuntimeException("Current password is incorrect!");
        }
    }

    @Override
    public User googleLogin(String email, String name, String googleId) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            return existingUser.get();
        } else {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(name);
            newUser.setPassword("GOOGLE_AUTH_USER_NO_PASSWORD");
            newUser.setRole("USER");
            return userRepository.save(newUser);
        }
    }

    // ==========================================
    // NEW: GitHub Login Logic (Member 4 Task)
    // ==========================================
    @Override
    public User githubLogin(String code) {
        RestTemplate restTemplate = new RestTemplate();

        // 1. Exchange 'code' for an 'access_token' from GitHub
        String tokenUrl = "https://github.com/login/oauth/access_token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/json");

        Map<String, String> tokenRequest = new HashMap<>();
        tokenRequest.put("client_id", "Ov23liTMXkUirMyotb3o"); // Using your precise Client ID
        tokenRequest.put("client_secret", "a215473c39e9d11409d3f5b1667aa3267f1ffad9"); // Using your precise Secret
        tokenRequest.put("code", code);

        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(tokenRequest, headers);
        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, requestEntity, Map.class);

        String accessToken = (String) tokenResponse.getBody().get("access_token");
        if (accessToken == null) {
            throw new RuntimeException("Failed to retrieve GitHub access token");
        }

        // 2. Use the 'access_token' to get user details from GitHub API
        String userUrl = "https://api.github.com/user";
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.set("Authorization", "Bearer " + accessToken);
        HttpEntity<String> userRequestEntity = new HttpEntity<>(userHeaders);

        ResponseEntity<Map> userResponse = restTemplate.exchange(userUrl, HttpMethod.GET, userRequestEntity, Map.class);
        Map<String, Object> githubUser = userResponse.getBody();

        String githubId = String.valueOf(githubUser.get("id"));
        String name = (String) githubUser.get("name");
        String email = (String) githubUser.get("email");

        // Fallbacks if GitHub user hasn't set a public name or email
        if (name == null) name = (String) githubUser.get("login");
        if (email == null) email = githubId + "@github.com";

        // 3. Save to DB or login existing user
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            return existingUser.get();
        } else {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(name);
            newUser.setPassword("GITHUB_AUTH_USER_NO_PASSWORD");
            newUser.setRole("USER"); // Default role
            return userRepository.save(newUser);
        }
    }
}