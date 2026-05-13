-- ================================================================
-- db-service/init.sql
-- MySQL initialization script for Smart Task Manager
--
-- This script runs automatically when the MySQL container starts
-- for the first time (docker-entrypoint-initdb.d/ mechanism).
--
-- It creates the database schema as a fallback in case JPA
-- ddl-auto=update hasn't created tables yet.
-- ================================================================

-- Use the database created by Docker environment variables
USE smarttaskdb;

-- ----------------------------------------------------------------
-- Users table
-- Stores registered application users with hashed passwords.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(80)     NOT NULL,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,             -- BCrypt hash
    role        ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- Tasks table
-- Stores tasks associated with users.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    title       VARCHAR(200)    NOT NULL,
    description VARCHAR(1000),
    status      ENUM('TODO', 'IN_PROGRESS', 'DONE') NOT NULL DEFAULT 'TODO',
    priority    ENUM('LOW', 'MEDIUM', 'HIGH')        NOT NULL DEFAULT 'MEDIUM',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    due_date    DATETIME,
    user_id     BIGINT          NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status  (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- Seed data (optional demo data for testing)
-- ----------------------------------------------------------------
-- Insert a demo admin user (password: Admin@1234 — BCrypt hash)
INSERT IGNORE INTO users (name, email, password, role) VALUES
    ('Admin', 'admin@smarttask.com', '$2a$12$Kd5SBx7Vz6G8OaWg5nDiReZ5xqn.RP9WrE6TlICBf5R3cxSjXJCFa', 'ADMIN');
