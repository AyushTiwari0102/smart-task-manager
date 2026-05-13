package com.smarttask.service;

import com.smarttask.model.Task;
import com.smarttask.model.Task.Priority;
import com.smarttask.model.Task.Status;
import com.smarttask.model.User;
import com.smarttask.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * TaskService - Business logic for task CRUD operations.
 * All operations are scoped to the authenticated user for security.
 */
@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    // Constructor injection (replaces @RequiredArgsConstructor)
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * Get all tasks for the authenticated user, optionally filtered by status.
     */
    @Transactional(readOnly = true)
    public List<Task> getTasksForUser(User user, Status status) {
        if (status != null) {
            return taskRepository.findByUserIdAndStatus(user.getId(), status);
        }
        return taskRepository.findByUserId(user.getId());
    }

    /**
     * Create a new task for the authenticated user.
     */
    public Task createTask(User user, String title, String description,
                           Priority priority, LocalDateTime dueDate) {
        Task task = Task.builder()
                .title(title)
                .description(description)
                .priority(priority != null ? priority : Priority.MEDIUM)
                .dueDate(dueDate)
                .user(user)
                .build();
        return taskRepository.save(task);
    }

    /**
     * Update an existing task — only the owner can update.
     */
    public Task updateTask(Long taskId, User user, String title, String description,
                           Status status, Priority priority, LocalDateTime dueDate) {
        Task task = getTaskByIdForUser(taskId, user);
        if (title != null)       task.setTitle(title);
        if (description != null) task.setDescription(description);
        if (status != null)      task.setStatus(status);
        if (priority != null)    task.setPriority(priority);
        if (dueDate != null)     task.setDueDate(dueDate);
        return taskRepository.save(task);
    }

    /**
     * Delete a task — only the owner can delete.
     */
    public void deleteTask(Long taskId, User user) {
        Task task = getTaskByIdForUser(taskId, user);
        taskRepository.delete(task);
    }

    /**
     * Get dashboard statistics for the authenticated user.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats(User user) {
        List<Object[]> rawStats = taskRepository.countByStatusForUser(user.getId());
        long total = taskRepository.countByUserId(user.getId());

        Map<String, Long> statusCounts = new HashMap<>();
        for (Status s : Status.values()) statusCounts.put(s.name(), 0L);
        for (Object[] row : rawStats) {
            statusCounts.put(row[0].toString(), (Long) row[1]);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("byStatus", statusCounts);
        return stats;
    }

    /** Internal: fetch task by ID and assert ownership */
    private Task getTaskByIdForUser(Long taskId, User user) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied to task: " + taskId);
        }
        return task;
    }
}
