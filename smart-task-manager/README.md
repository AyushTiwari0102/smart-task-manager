# Smart Task Manager

A **microservices-based task management application** built as a DevOps CI/CD project demonstrating Docker Compose, Maven, GitHub Actions, and Jenkins.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    stm-network (bridge)                  │
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  frontend   │    │   backend   │    │     db      │  │
│  │ nginx:80    │───▶│ spring:8080 │───▶│  mysql:3306 │  │
│  └─────────────┘    └──────┬──────┘    └─────────────┘  │
│                            │                             │
│                     ┌──────▼──────┐                      │
│                     │    redis    │                      │
│                     │  redis:6379 │                      │
│                     └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

| Service | Technology | Port | Purpose |
|---------|-----------|------|---------|
| `frontend` | Nginx + HTML/CSS/JS | 80 | UI + API Proxy |
| `backend` | Spring Boot 3 + Java 17 | 8080 | REST API |
| `db` | MySQL 8 | 3306 | Data persistence |
| `redis` | Redis 7 | 6379 | Session / Cache |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/AyushTiwari0102/smart-task-manager.git
cd smart-task-manager

# Start all services
docker-compose up --build

# Access the app
open http://localhost
```

## Project Structure

```
smart-task-manager/
├── frontend-service/          # Nginx + HTML/CSS/JS
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── index.html
│       ├── style.css
│       └── app.js
├── backend-service/           # Spring Boot REST API
│   ├── Dockerfile
│   ├── pom.xml                # Maven build
│   └── src/main/java/com/smarttask/
│       ├── controller/        # REST endpoints
│       ├── service/           # Business logic
│       ├── model/             # JPA entities
│       ├── repository/        # Spring Data repos
│       └── config/            # Security + JWT
├── db-service/
│   └── init.sql               # MySQL schema
├── docker-compose.yml         # Multi-container orchestration
├── Jenkinsfile                # Jenkins CI/CD pipeline
└── .github/workflows/ci.yml   # GitHub Actions workflow
```

## REST API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Create account |
| `POST` | `/api/auth/login` | ❌ | Login, get JWT |
| `GET` | `/api/tasks` | ✅ | List tasks |
| `POST` | `/api/tasks` | ✅ | Create task |
| `PUT` | `/api/tasks/{id}` | ✅ | Update task |
| `DELETE` | `/api/tasks/{id}` | ✅ | Delete task |
| `GET` | `/api/tasks/stats` | ✅ | Dashboard stats |

## Maven Lifecycle

```bash
cd backend-service
mvn clean compile    # Compile Java source
mvn test             # Run unit tests
mvn package          # Build executable JAR
mvn package -DskipTests  # Skip tests (for Docker builds)
```

## Jenkins Setup

1. Install Jenkins with Docker and Pipeline plugins
2. Create a new **Pipeline** job
3. Point SCM to this repository
4. Add `docker-hub-credentials` in Jenkins Credentials
5. Run the pipeline — all 7 stages will execute automatically

## Demo Credentials

- **URL**: http://localhost
- **Admin**: `admin@smarttask.com` / `Admin@1234`

## Tech Stack

- **Backend**: Java 17, Spring Boot 3.2, Spring Security, JWT, JPA
- **Frontend**: Vanilla HTML/CSS/JS, Nginx
- **Database**: MySQL 8
- **Cache**: Redis 7
- **Build**: Maven 3.9
- **CI**: GitHub Actions
- **CD**: Jenkins (Declarative Pipeline)
- **Container**: Docker + Docker Compose
