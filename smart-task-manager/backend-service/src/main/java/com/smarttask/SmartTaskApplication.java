package com.smarttask;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * SmartTaskApplication - Entry point for the Smart Task Manager backend.
 * This is a Spring Boot microservice that exposes REST APIs for task
 * and user management, backed by MySQL and Redis.
 */
@SpringBootApplication
public class SmartTaskApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartTaskApplication.class, args);
    }
}
