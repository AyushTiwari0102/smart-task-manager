package com.smarttask.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Task entity - represents a single task belonging to a User.
 * Stored in the MySQL `tasks` table.
 */
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(min = 1, max = 200)
    @Column(nullable = false)
    private String title;

    @Size(max = 1000)
    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime dueDate;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public enum Status   { TODO, IN_PROGRESS, DONE }
    public enum Priority { LOW, MEDIUM, HIGH }

    // ---------- Lifecycle ----------
    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    // ---------- Constructors ----------
    public Task() {}

    // ---------- Getters & Setters ----------
    public Long getId()                         { return id; }
    public String getTitle()                    { return title; }
    public void setTitle(String title)          { this.title = title; }
    public String getDescription()              { return description; }
    public void setDescription(String desc)     { this.description = desc; }
    public Status getStatus()                   { return status; }
    public void setStatus(Status status)        { this.status = status; }
    public Priority getPriority()               { return priority; }
    public void setPriority(Priority priority)  { this.priority = priority; }
    public LocalDateTime getCreatedAt()         { return createdAt; }
    public LocalDateTime getUpdatedAt()         { return updatedAt; }
    public LocalDateTime getDueDate()           { return dueDate; }
    public void setDueDate(LocalDateTime d)     { this.dueDate = d; }
    public User getUser()                       { return user; }
    public void setUser(User user)              { this.user = user; }

    // ---------- Builder ----------
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Task task = new Task();
        public Builder title(String v)       { task.title = v; return this; }
        public Builder description(String v) { task.description = v; return this; }
        public Builder status(Status v)      { task.status = v; return this; }
        public Builder priority(Priority v)  { task.priority = v; return this; }
        public Builder dueDate(LocalDateTime v) { task.dueDate = v; return this; }
        public Builder user(User v)          { task.user = v; return this; }
        public Task build()                  { return task; }
    }
}
