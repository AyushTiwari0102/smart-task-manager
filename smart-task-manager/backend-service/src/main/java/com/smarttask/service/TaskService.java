package com.smarttask.service;

import com.smarttask.model.Task;
import com.smarttask.model.Task.Priority;
import com.smarttask.model.Task.Status;
import com.smarttask.model.User;
import com.smarttask.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * TaskService - Business logic for task CRUD operations.
 *
 * All task operations are scoped to the authenticated user — users cannot
 * access or modify tasks that belong to other users. This is enforced by
 * filtering on userId throughout every query.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    /**
     * Get all tasks for the authenticated user.
     * Optionally filter by status.
     *
     * @param user   the authenticated user
     * @param status optional status filter (null = return all)
     * @return list of tasks
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
     *
     * @param user        the owner
     * @param title       task title (required)
     * @param description optional description
     * @param priority    task priority level
     * @param dueDate     optional due date
     * @return the persisted task
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
     *
     * @param taskId      the task ID
     * @param user        the requesting user (must be owner)
     * @param title       updated title
     * @param description updated description
     * @param status      updated status
     * @param priority    updated priority
     * @param dueDate     updated due date
     * @return the updated task
     */
    public Task updateTask(Long taskId, User user, String title, String description,
                           Status status, Priority priority, LocalDateTime dueDate) {
        Task task = getTaskByIdForUser(taskId, user);

        if (title != null) task.setTitle(title);
        if (description != null) task.setDescription(description);
        if (status != null) task.setStatus(status);
        if (priority != null) task.setPriority(priority);
        if (dueDate != null) task.setDueDate(dueDate);

        return taskRepository.save(task);
    }

    /**
     * Delete a task — only the owner can delete.
     *
     * @param taskId the task ID
     * @param user   the requesting user
     */
    public void deleteTask(Long taskId, User user) {
        Task task = getTaskByIdForUser(taskId, user);
        taskRepository.delete(task);
    }

    /**
     * Get dashboard statistics for the authenticated user.
     * Returns counts of tasks per status.
     *
     * @param user the authenticated user
     * @return map of status → count
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
