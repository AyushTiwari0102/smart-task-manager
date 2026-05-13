package com.smarttask.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * JwtUtil - Utility class for creating and validating JSON Web Tokens.
 *
 * Tokens are signed using HMAC-SHA256 with a secret key loaded from
 * application properties. Each token embeds the user's email as the subject
 * and carries an expiry timestamp.
 */
@Component
public class JwtUtil {

    /** Secret key loaded from application.properties (must be ≥ 256 bits) */
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    /** Token validity duration in milliseconds */
    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    /**
     * Build and sign a new JWT for the given email.
     *
     * @param email the subject to embed in the token
     * @return signed JWT string
     */
    public String generateToken(String email) {
        Key signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract the email (subject) from a valid JWT.
     *
     * @param token the JWT string
     * @return email stored in the token
     */
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Validate a token - checks signature and expiry.
     *
     * @param token the JWT string to validate
     * @return true if the token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /** Internal helper: parse and return claims from the token */
    private Claims parseClaims(String token) {
        Key signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
