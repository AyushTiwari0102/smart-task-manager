# ================================================================
# Backend Service Dockerfile - Multi-Stage Build
# Stage 1: Build the JAR using Maven
# Stage 2: Run the JAR using a slim JRE image
# ================================================================

# ---------- Stage 1: Build ----------
# Use the official Maven image with JDK 17 to compile and package the app
FROM maven:3.9.6-eclipse-temurin-17 AS builder

# Set working directory inside the build container
WORKDIR /app

# Copy pom.xml first and download dependencies (leverages Docker layer caching)
# If pom.xml hasn't changed, this layer is reused on subsequent builds
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and run the Maven package phase
# -DskipTests skips unit tests during the Docker build (tests run in CI separately)
COPY src ./src
RUN mvn package -DskipTests -B

# ---------- Stage 2: Run ----------
# Use a minimal JRE image (no Maven or JDK) to keep the image small
FROM eclipse-temurin:17-jre-alpine

# Install wget for the health check (not included in alpine JRE by default)
RUN apk add --no-cache wget

# Add a non-root user for security best practices
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy the packaged JAR from the build stage
COPY --from=builder /app/target/backend-service-1.0.0.jar app.jar

# Change ownership to the non-root user
RUN chown appuser:appgroup app.jar

# Switch to non-root user
USER appuser

# Expose the Spring Boot server port
EXPOSE 8080

# Health check - Docker will restart the container if the API stops responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
