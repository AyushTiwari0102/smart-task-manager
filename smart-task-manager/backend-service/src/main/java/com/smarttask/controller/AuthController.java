package com.smarttask.controller;

import com.smarttask.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController - REST endpoints for user registration and login.
 *
 * Routes:
 *   POST /api/auth/register  - Create a new account
 *   POST /api/auth/login     - Authenticate and receive a JWT
 *
 * These routes are publicly accessible (no JWT required).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    // Constructor injection (replaces @RequiredArgsConstructor)
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/auth/register */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            Map<String, Object> response = authService.register(
                    req.getName(), req.getEmail(), req.getPassword());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            Map<String, Object> response = authService.login(req.getEmail(), req.getPassword());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ---- Request DTOs (plain Java, no Lombok) ----

    public static class RegisterRequest {
        @NotBlank @Size(min = 2, max = 80)
        private String name;
        @Email @NotBlank
        private String email;
        @NotBlank @Size(min = 6, max = 100)
        private String password;

        public String getName()          { return name; }
        public void setName(String v)    { this.name = v; }
        public String getEmail()         { return email; }
        public void setEmail(String v)   { this.email = v; }
        public String getPassword()      { return password; }
        public void setPassword(String v){ this.password = v; }
    }

    public static class LoginRequest {
        @Email @NotBlank
        private String email;
        @NotBlank
        private String password;

        public String getEmail()         { return email; }
        public void setEmail(String v)   { this.email = v; }
        public String getPassword()      { return password; }
        public void setPassword(String v){ this.password = v; }
    }
}
