# Docker Development Setup

This directory contains all Docker configurations for the Weather application monorepo.

## Quick Start

1. **Prerequisites**
   - Docker Engine 20.10+
   - Docker Compose 2.0+

2. **Environment Setup**

   ```bash
   # Copy the example environment file to create your local .env
   cp .env.example .env

   # Edit .env with your configuration
   # The default values work for local development, but you should:
   # - Change all secrets/passwords for production
   # - Add any third-party API keys you need (Twitter, Google Maps, etc.)
   nano .env  # or use your preferred editor
   ```

   **Important**: The `.env` file in the root directory contains ALL environment variables for all services (APIs, Web, Classifier, Scraper, and MongoDB). This centralizes configuration management.

3. **Build and Start Services**

   ```bash
   # Build all services
   docker compose build

   # Start all services
   docker compose up

   # Or build and start in one command
   docker compose up --build

   # Run in detached mode
   docker compose up -d
   ```

4. **Access Services**
   - **Web Frontend**: http://localhost:5173
   - **Backend APIs**: http://localhost:3001
   - **Classifier Service**: http://localhost:8000
   - **Scraper Service**: http://localhost:8001
   - **MongoDB**: mongodb://localhost:27017

## Available Dockerfiles

Located in the `docker/` directory:

- **Dockerfile.apis** - Backend API service (Bun/Node.js)
- **Dockerfile.web** - Frontend web application (Vite/React)
- **Dockerfile.classifier** - Disaster classification service (Python)
- **Dockerfile.scraper** - Twitter scraping service (Python)

## Docker Compose Services

### mongodb

- Official MongoDB 7.0 image
- Data persistence via Docker volumes
- Health checks enabled
- Default credentials (change in production!)

### apis

- Backend API service
- Built with Bun runtime
- Hot-reload enabled via volume mounts
- Depends on MongoDB

### web

- Frontend React application
- Vite dev server with HMR
- Exposed on port 5173
- Hot-reload enabled

### classifier

- ML-based disaster classification
- Python 3.11 with scikit-learn
- Loads pre-trained models on startup

### scraper

- Twitter/social media scraping service
- Python 3.11 with Scrapy
- Scheduled data collection

## Common Commands

```bash
# View logs
docker compose logs -f [service-name]

# Stop services
docker compose down

# Stop and remove volumes (WARNING: destroys data)
docker compose down -v

# Rebuild a specific service
docker compose build [service-name]

# Restart a specific service
docker compose restart [service-name]

# Execute commands in a running container
docker compose exec apis bun run lint
docker compose exec classifier python -m pytest

# View running containers
docker compose ps

# View resource usage
docker stats
```

## Development Workflow

### Hot Reloading

All services are configured with volume mounts for hot-reloading:

- **Node/Bun services**: Changes reflect immediately
- **Python services**: Changes reflect on next request/restart

### Installing Dependencies

**For Node/Bun services:**

```bash
# From host (affects container via volume mount)
bun install <package>

# Or from container
docker compose exec apis bun install <package>
```

**For Python services:**

```bash
# Rebuild the container
docker compose build classifier
docker compose up -d classifier
```

### Database Access

**Using MongoDB shell:**

```bash
docker compose exec mongodb mongosh -u admin -p password
```

**Using external tools:**
Connect to `mongodb://admin:password@localhost:27017`

### Debugging

**View service logs:**

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f apis
```

**Inspect container:**

```bash
docker compose exec apis sh
```

## Production Considerations

This setup is for **development only**. For production:

1. Use multi-stage builds to reduce image size
2. Don't mount source code as volumes
3. Use proper secrets management (not .env files)
4. Configure MongoDB authentication properly
5. Use production-grade web servers (nginx, etc.)
6. Enable HTTPS/TLS
7. Set proper resource limits
8. Configure health checks and monitoring
9. Use specific image tags (not `latest`)

## Troubleshooting

### Port Conflicts

If ports are already in use, modify them in `docker-compose.yml`:

```yaml
ports:
  - "3002:3001" # Maps host:3002 to container:3001
```

### Volume Permission Issues

On Linux, you may need to set proper ownership:

```bash
sudo chown -R $USER:$USER .
```

### Clean Rebuild

If experiencing issues:

```bash
docker compose down -v
docker compose build --no-cache
docker compose up
```

### MongoDB Connection Errors

Ensure MongoDB is healthy:

```bash
docker compose ps
docker compose logs mongodb
```

## Directory Structure

```
weather/
├── docker/
│   ├── Dockerfile.apis
│   ├── Dockerfile.web
│   ├── Dockerfile.classifier
│   └── Dockerfile.scraper
├── docker-compose.yml
├── .env.example
├── .dockerignore
├── apps/
│   ├── apis/.dockerignore
│   ├── web/.dockerignore
│   ├── classifier/.dockerignore
│   ├── scraper/.dockerignore
│   └── mobile/.dockerignore
└── packages/
    ├── config-typescript/.dockerignore
    ├── database/.dockerignore
    └── types/.dockerignore
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Bun Docker Guide](https://bun.sh/docs/installation#docker)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
