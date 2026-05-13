package com.smarttask.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * User entity - represents a registered application user.
 * Stored in the MySQL `users` table.
 */
@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Display name of the user */
    @NotBlank
    @Size(min = 2, max = 80)
    @Column(nullable = false)
    private String name;

    /** Unique email used for login */
    @Email
    @NotBlank
    @Column(nullable = false, unique = true)
    private String email;

    /** BCrypt-hashed password */
    @NotBlank
    @Column(nullable = false)
    private String password;

    /** Account role: USER or ADMIN */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    /** Timestamp of account creation */
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Tasks owned by this user (bidirectional relationship) */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Task> tasks = new ArrayList<>();

    public enum Role {
        USER, ADMIN
    }
}
