# Weather Disaster Monitoring System

A comprehensive monorepo application for monitoring, classifying, and reporting weather-related disasters and hazards.

## Quick Start

### Prerequisites

- **Bun** 1.1.38+ (for Node.js services)
- **Python** 3.11+ (for ML services)
- **Docker & Docker Compose** (for containerized development)
- **MongoDB** 7.0+ (or use Docker)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/SINGH-RAJVEER/weather.git
   cd weather
   ```

2. **Configure environment variables**

   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit with your configuration
   nano .env
   ```

   **Important:** The `.env` file contains all configuration for all services. See [Environment Variables Guide](docs/ENVIRONMENT.md) for details.

3. **Choose your development method:**

#### Option A: Docker (Recommended)

```bash
# Build and start all services
docker compose up --build

# Or run in background
docker compose up -d --build
```

**Access services:**

- Web Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Classifier: http://localhost:8000
- Scraper: http://localhost:8001
- MongoDB: mongodb://localhost:27017

#### Option B: Local Development

```bash
# Install dependencies
bun install

# Start MongoDB (if not using Docker)
# Option 1: Docker MongoDB only
docker compose up mongodb -d

# Option 2: Local MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux

# Start all services
bun dev

# Or start individual services
cd apps/apis && bun dev          # Backend API
cd apps/web && bun dev           # Frontend
cd apps/classifier && python -m src  # Classifier
cd apps/scraper && python -m src     # Scraper
```

## Project Structure

```
weather/
├── apps/
│   ├── apis/           # Backend API service (Bun + Express + MongoDB)
│   ├── web/            # Frontend web app (React + Vite)
│   ├── mobile/         # Mobile app (React Native + Expo)
│   ├── classifier/     # ML disaster classifier (Python)
│   └── scraper/        # Social media scraper (Python + Scrapy)
├── packages/
│   ├── shared/         # Shared code (contexts, utils, API clients, hooks)
│   ├── config-typescript/  # Shared TypeScript configs
│   ├── database/       # Shared database models
│   └── types/          # Shared TypeScript types
├── docker/             # Docker configurations
│   ├── Dockerfile.apis
│   ├── Dockerfile.web
│   ├── Dockerfile.classifier
│   └── Dockerfile.scraper
├── docs/               # Documentation
│   └── ENVIRONMENT.md  # Environment variables guide
├── .env.example        # Example environment variables
├── .env                # Your local environment (not committed)
├── docker-compose.yml  # Docker Compose configuration
├── turbo.json          # Turborepo configuration
└── package.json        # Root package configuration
```

## ️Architecture

### Services

1. **Backend API (apps/apis)**
   - REST API for all data operations
   - Authentication with Better Auth
   - MongoDB integration
   - Port: 3001

2. **Frontend Web (apps/web)**
   - React-based web interface
   - Real-time disaster monitoring
   - Interactive maps with Leaflet
   - Port: 5173

3. **Mobile App (apps/mobile)**
   - React Native + Expo
   - Cross-platform (iOS/Android)
   - Offline support planned

4. **Classifier (apps/classifier)**
   - ML-based disaster classification
   - Fine-tuned transformer models
   - REST API for predictions
   - Port: 8000

5. **Scraper (apps/scraper)**
   - Social media data collection
   - Twitter/X integration
   - Automatic classification
   - Port: 8001

### Shared Packages

- **@weather/shared** - Common utilities, contexts, API clients, and hooks used by web and mobile apps
- **@weather/database** - MongoDB models and connection
- **@weather/types** - Shared TypeScript types
- **@weather/config-typescript** - TS configs for all apps

## Environment Variables

All configuration is centralized in the root `.env` file. Key variables:

```env
# Database
MONGODB_URI=mongodb://admin:password@localhost:27017
DB_NAME=weather

# Backend API
PORT=3001
BETTER_AUTH_SECRET=your-secret-min-32-chars
BETTER_AUTH_URL=http://localhost:3001

# Frontend
VITE_API_URL=http://localhost:3001

# Services
CLASSIFIER_PORT=8000
SCRAPER_PORT=8001
CLASSIFIER_URL=http://localhost:8000
```

**📖 Full documentation:** [Environment Variables Guide](docs/ENVIRONMENT.md)

## 🛠️ Development

### Common Commands

```bash
# Install dependencies
bun install

# Development mode (all services)
bun dev

# Build all apps
bun build

# Lint and format
bun lint
bun format

# Clean build artifacts
bun clean
```

### Docker Commands

```bash
# Start all services
docker compose up

# Start specific service
docker compose up web

# View logs
docker compose logs -f apis

# Rebuild service
docker compose build apis

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Working with the Monorepo

This project uses Turborepo for efficient monorepo management:

- **Workspace protocol:** `workspace:*` for local packages
- **Parallel execution:** Turbo runs tasks in parallel where possible
- **Caching:** Build outputs are cached

## Documentation

- [Environment Variables](docs/ENVIRONMENT.md) - Complete environment configuration guide
- [Docker Setup](docker/README.md) - Docker and Docker Compose guide
- API documentation (coming soon)
- Deployment guide (coming soon)

## Tech Stack

### Frontend

- **React** 18 - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **i18next** - Internationalization

### Backend

- **Bun** - JavaScript runtime
- **Express** - Web framework
- **Better Auth** - Authentication
- **MongoDB** - Database
- **Mongoose** - ODM

### ML/Data

- **Python** 3.11
- **PyTorch** - Deep learning
- **Transformers** - NLP models
- **Scrapy** - Web scraping
- **Sentence Transformers** - Text embeddings

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Turborepo** - Monorepo management
- **Biome** - Linting and formatting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use **Biome** for linting and formatting
- Run `bun check` before committing
- Follow existing code patterns

## License

This project is licensed under the MIT License.

## Acknowledgments

- Hugging Face for pre-trained models
- OpenStreetMap for map tiles
- MongoDB for database solutions

## Support

- Issues: [GitHub Issues](https://github.com/SINGH-RAJVEER/weather/issues)
- Discussions: [GitHub Discussions](https://github.com/SINGH-RAJVEER/weather/discussions)

---
