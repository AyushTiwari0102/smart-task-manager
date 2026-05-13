package com.smarttask;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * SmartTaskApplicationTests - Verifies that the Spring application context
 * loads successfully. Uses H2 in-memory database instead of MySQL
 * and a test Redis config so no external services are needed.
 */
@SpringBootTest
@TestPropertySource(properties = {
    // Use H2 in-memory database for tests (no MySQL needed)
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    // Disable Redis auto-configuration for tests
    "spring.data.redis.host=localhost",
    "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration",
    // JWT secret for tests
    "app.jwt.secret=TestSecretKeyThatIsAtLeast256BitsLongForJWTSigning!!"
})
class SmartTaskApplicationTests {

    @Test
    void contextLoads() {
        // If the application context fails to start, this test will fail.
        // This acts as a smoke test for the entire configuration.
    }
}
