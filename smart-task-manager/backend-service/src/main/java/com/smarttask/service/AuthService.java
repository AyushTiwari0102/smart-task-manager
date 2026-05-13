package com.smarttask.service;

import com.smarttask.config.JwtUtil;
import com.smarttask.model.User;
import com.smarttask.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * AuthService - Business logic for user registration and login.
 *
 * Responsibilities:
 * - Validate uniqueness of email on registration
 * - Hash passwords using BCrypt before persisting
 * - Verify credentials on login using BCrypt comparison
 * - Issue JWT tokens upon successful authentication
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Constructor injection (replaces @RequiredArgsConstructor)
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Register a new user.
     *
     * @param name     display name
     * @param email    unique email (used as login ID)
     * @param password plain-text password (will be hashed)
     * @return JWT token + user info map
     */
    public Map<String, Object> register(String name, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered: " + email);
        }

        // Build and persist user with BCrypt-hashed password
        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .build();
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(email);
        return buildAuthResponse(user, token);
    }

    /**
     * Authenticate an existing user.
     *
     * @param email    registered email
     * @param password plain-text password to verify
     * @return JWT token + user info map
     */
    public Map<String, Object> login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // BCrypt comparison — never compare plain text directly
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(email);
        return buildAuthResponse(user, token);
    }

    /** Helper: build a consistent auth response map */
    private Map<String, Object> buildAuthResponse(User user, String token) {
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        return response;
    }
}
