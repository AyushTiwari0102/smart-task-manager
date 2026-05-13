package com.smarttask.repository;

import com.smarttask.model.Task;
import com.smarttask.model.Task.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * TaskRepository - Spring Data JPA repository for Task entities.
 * Provides task-specific queries for filtering by user, status, and priority.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Get all tasks belonging to a specific user.
     *
     * @param userId the ID of the task owner
     * @return list of tasks for this user
     */
    List<Task> findByUserId(Long userId);

    /**
     * Get all tasks for a user filtered by status.
     *
     * @param userId the task owner's ID
     * @param status the desired task status (TODO, IN_PROGRESS, DONE)
     * @return filtered task list
     */
    List<Task> findByUserIdAndStatus(Long userId, Status status);

    /**
     * Count tasks grouped by status for a given user.
     * Used for dashboard summary statistics.
     *
     * @param userId the task owner's ID
     * @return list of [status, count] pairs
     */
    @Query("SELECT t.status, COUNT(t) FROM Task t WHERE t.user.id = :userId GROUP BY t.status")
    List<Object[]> countByStatusForUser(@Param("userId") Long userId);

    /**
     * Count total tasks for a user.
     *
     * @param userId the task owner's ID
     * @return total task count
     */
    long countByUserId(Long userId);
}
