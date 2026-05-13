package com.smarttask.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

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
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(min = 2, max = 80)
    @Column(nullable = false)
    private String name;

    @Email @NotBlank
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();

    public enum Role { USER, ADMIN }

    // ---------- Constructors ----------
    public User() {}

    public User(String name, String email, String password, Role role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // ---------- Getters & Setters ----------
    public Long getId()                     { return id; }
    public String getName()                 { return name; }
    public void setName(String name)        { this.name = name; }
    public String getEmail()                { return email; }
    public void setEmail(String email)      { this.email = email; }
    public String getPassword()             { return password; }
    public void setPassword(String pw)      { this.password = pw; }
    public Role getRole()                   { return role; }
    public void setRole(Role role)          { this.role = role; }
    public LocalDateTime getCreatedAt()     { return createdAt; }
    public List<Task> getTasks()            { return tasks; }

    // ---------- Builder ----------
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String name, email, password;
        private Role role = Role.USER;
        public Builder name(String v)     { this.name = v; return this; }
        public Builder email(String v)    { this.email = v; return this; }
        public Builder password(String v) { this.password = v; return this; }
        public Builder role(Role v)       { this.role = v; return this; }
        public User build() { return new User(name, email, password, role); }
    }
}
