package com.smarttask.controller;

import com.smarttask.model.Task;
import com.smarttask.model.Task.Priority;
import com.smarttask.model.Task.Status;
import com.smarttask.model.User;
import com.smarttask.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * TaskController - REST endpoints for task management.
 *
 * All routes require a valid JWT (enforced by SecurityConfig + JwtAuthFilter).
 * The authenticated user is injected via @AuthenticationPrincipal.
 *
 * Routes:
 *   GET    /api/tasks            - List all tasks (optional ?status= filter)
 *   POST   /api/tasks            - Create a new task
 *   PUT    /api/tasks/{id}       - Update a task
 *   DELETE /api/tasks/{id}       - Delete a task
 *   GET    /api/tasks/stats      - Dashboard statistics
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    // Constructor injection (replaces @RequiredArgsConstructor)
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /** GET /api/tasks?status=TODO|IN_PROGRESS|DONE */
    @GetMapping
    public ResponseEntity<List<Task>> getTasks(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Status status) {
        return ResponseEntity.ok(taskService.getTasksForUser(user, status));
    }

    /** GET /api/tasks/stats */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.getDashboardStats(user));
    }

    /** POST /api/tasks */
    @PostMapping
    public ResponseEntity<Task> createTask(
            @AuthenticationPrincipal User user,
            @RequestBody TaskRequest req) {
        Task task = taskService.createTask(
                user, req.getTitle(), req.getDescription(),
                req.getPriority(), req.getDueDate());
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    /** PUT /api/tasks/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody TaskRequest req) {
        try {
            Task updated = taskService.updateTask(
                    id, user, req.getTitle(), req.getDescription(),
                    req.getStatus(), req.getPriority(), req.getDueDate());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /** DELETE /api/tasks/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            taskService.deleteTask(id, user);
            return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    // ---- Request DTO (plain Java, no Lombok) ----

    public static class TaskRequest {
        private String title;
        private String description;
        private Status status;
        private Priority priority;
        private LocalDateTime dueDate;

        public String getTitle()              { return title; }
        public void setTitle(String v)        { this.title = v; }
        public String getDescription()        { return description; }
        public void setDescription(String v)  { this.description = v; }
        public Status getStatus()             { return status; }
        public void setStatus(Status v)       { this.status = v; }
        public Priority getPriority()         { return priority; }
        public void setPriority(Priority v)   { this.priority = v; }
        public LocalDateTime getDueDate()     { return dueDate; }
        public void setDueDate(LocalDateTime v){ this.dueDate = v; }
    }
}
