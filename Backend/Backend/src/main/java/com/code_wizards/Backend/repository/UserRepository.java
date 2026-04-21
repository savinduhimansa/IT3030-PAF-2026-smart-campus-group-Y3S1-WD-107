package com.code_wizards.Backend.repository;

import com.code_wizards.Backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Find a user by their email address
    Optional<User> findByEmail(String email);

    List<User> findByRole(String admin);
}