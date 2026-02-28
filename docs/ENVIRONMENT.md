# Environment Variables Guide

This document provides a comprehensive guide to all environment variables used across the Weather application monorepo.

## Overview

All environment variables are centrally managed in the root `.env` file. This file is loaded by:

- Docker Compose services
- Individual apps and packages
- Build tools (Vite, etc.)

## Setup

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:

   ```bash
   nano .env  # or your preferred editor
   ```

3. **Never commit `.env` to version control** - it contains secrets!

## Environment Variables Reference

### General Configuration

| Variable      | Description              | Default       | Required |
| ------------- | ------------------------ | ------------- | -------- |
| `NODE_ENV`    | Node.js environment mode | `development` | Yes      |
| `ENVIRONMENT` | General environment mode | `development` | Yes      |

### MongoDB Database

| Variable                     | Description                             | Default                                    | Required |
| ---------------------------- | --------------------------------------- | ------------------------------------------ | -------- |
| `MONGO_INITDB_ROOT_USERNAME` | MongoDB root username                   | `admin`                                    | Yes      |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB root password                   | `password`                                 | Yes      |
| `MONGO_INITDB_DATABASE`      | Initial database name                   | `weather`                                  | Yes      |
| `MONGODB_URI`                | MongoDB connection string               | `mongodb://admin:password@localhost:27017` | Yes      |
| `DB_NAME`                    | Database name to use                    | `weather`                                  | Yes      |
| `MONGO_URL`                  | Alternative MongoDB URI (compatibility) | Same as `MONGODB_URI`                      | No       |
| `MONGO_DB`                   | Alternative DB name (compatibility)     | Same as `DB_NAME`                          | No       |

**Notes:**

- In Docker, use `mongodb://admin:password@mongodb:27017` (service name: `mongodb`)
- For local development, use `mongodb://admin:password@localhost:27017`

### Backend API Service (apps/apis)

| Variable             | Description                               | Default                                       | Required |
| -------------------- | ----------------------------------------- | --------------------------------------------- | -------- |
| `PORT`               | API server port                           | `3001`                                        | Yes      |
| `API_HOST`           | API server host                           | `0.0.0.0`                                     | No       |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth (min 32 chars) | -                                             | Yes      |
| `BETTER_AUTH_URL`    | Base URL for Better Auth                  | `http://localhost:3001`                       | Yes      |
| `SESSION_SECRET`     | Session encryption secret                 | -                                             | Yes      |
| `SESSION_EXPIRES_IN` | Session expiration (seconds)              | `604800` (7 days)                             | No       |
| `SESSION_UPDATE_AGE` | Session update interval (seconds)         | `86400` (1 day)                               | No       |
| `CORS_ORIGINS`       | Allowed CORS origins (comma-separated)    | `http://localhost:5173,http://localhost:3000` | Yes      |
| `JWT_SECRET`         | JWT signing secret                        | -                                             | Yes      |
| `JWT_EXPIRES_IN`     | JWT expiration time                       | `7d`                                          | No       |

**Security Notes:**

- Generate strong secrets using: `openssl rand -base64 32`
- Change all default secrets in production
- Use environment-specific `BETTER_AUTH_URL` values

### Frontend Web Service (apps/web)

| Variable                   | Description          | Default                 | Required |
| -------------------------- | -------------------- | ----------------------- | -------- |
| `VITE_API_URL`             | Backend API URL      | `http://localhost:3001` | Yes      |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key  | -                       | No       |
| `VITE_ANALYTICS_ID`        | Analytics service ID | -                       | No       |

**Notes:**

- All Vite variables must be prefixed with `VITE_`
- These are exposed to the client-side code
- In Docker, use service name: `http://apis:3001`

### Mobile App Service (apps/mobile)

| Variable              | Description         | Default                 | Required |
| --------------------- | ------------------- | ----------------------- | -------- |
| `EXPO_PUBLIC_API_URL` | Backend API URL     | `http://localhost:3001` | Yes      |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | -                       | No       |

**Notes:**

- Expo public variables are prefixed with `EXPO_PUBLIC_`
- These are exposed to the client-side code

### Classifier Service (apps/classifier)

| Variable            | Description                     | Default                          | Required |
| ------------------- | ------------------------------- | -------------------------------- | -------- |
| `CLASSIFIER_PORT`   | Classifier API port             | `8000`                           | Yes      |
| `CLASSIFIER_HOST`   | Classifier API host             | `0.0.0.0`                        | No       |
| `PYTHONUNBUFFERED`  | Disable Python output buffering | `1`                              | Yes      |
| `MODEL_PATH`        | Path to ML model                | `models/fine-tuned-model`        | No       |
| `MODEL_NAME`        | Model identifier                | `fine-tuned-disaster-classifier` | No       |
| `HUGGINGFACE_TOKEN` | Hugging Face API token          | -                                | No       |

### Scraper Service (apps/scraper)

| Variable                        | Description            | Default                 | Required |
| ------------------------------- | ---------------------- | ----------------------- | -------- |
| `SCRAPER_PORT`                  | Scraper API port       | `8001`                  | Yes      |
| `SCRAPER_HOST`                  | Scraper API host       | `0.0.0.0`               | No       |
| `CLASSIFIER_URL`                | Classifier service URL | `http://localhost:8000` | Yes      |
| `SCRAPER_BACKOFF_SECONDS`       | Initial backoff time   | `1`                     | No       |
| `SCRAPER_MAX_BACKOFF_SECONDS`   | Maximum backoff time   | `60`                    | No       |
| `SCRAPER_STALL_TIMEOUT_SECONDS` | Request timeout        | `180`                   | No       |

**Twitter/X API Credentials:**

| Variable                      | Description                 | Required |
| ----------------------------- | --------------------------- | -------- |
| `TWITTER_API_KEY`             | Twitter API key             | Optional |
| `TWITTER_API_SECRET`          | Twitter API secret          | Optional |
| `TWITTER_BEARER_TOKEN`        | Twitter bearer token        | Optional |
| `TWITTER_ACCESS_TOKEN`        | Twitter access token        | Optional |
| `TWITTER_ACCESS_TOKEN_SECRET` | Twitter access token secret | Optional |

**Reddit API Credentials:**

| Variable               | Description          | Required |
| ---------------------- | -------------------- | -------- |
| `REDDIT_CLIENT_ID`     | Reddit client ID     | Optional |
| `REDDIT_CLIENT_SECRET` | Reddit client secret | Optional |
| `REDDIT_USER_AGENT`    | Reddit user agent    | Optional |

### Optional Third-Party Services

**Email Service (SMTP):**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@weather-app.com
```

**SMS Service (Twilio):**

```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Cloud Storage (AWS S3):**

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

**Monitoring (Sentry):**

```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
LOG_LEVEL=info
```

## Environment-Specific Configuration

### Development (Local)

```env
NODE_ENV=development
MONGODB_URI=mongodb://admin:password@localhost:27017
VITE_API_URL=http://localhost:3001
CLASSIFIER_URL=http://localhost:8000
```

### Development (Docker)

```env
NODE_ENV=development
MONGODB_URI=mongodb://admin:password@mongodb:27017
VITE_API_URL=http://localhost:3001
CLASSIFIER_URL=http://classifier:8000
```

### Production

```env
NODE_ENV=production
MONGODB_URI=mongodb://username:password@prod-mongo-host:27017
BETTER_AUTH_URL=https://api.yourdomain.com
VITE_API_URL=https://api.yourdomain.com
CLASSIFIER_URL=http://classifier:8000
```

**Production Security Checklist:**

- [ ] Change all default passwords
- [ ] Use strong random secrets (32+ characters)
- [ ] Enable SSL/TLS for MongoDB
- [ ] Use HTTPS URLs for all public-facing services
- [ ] Restrict CORS origins to your domains
- [ ] Enable authentication for all services
- [ ] Use secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)
- [ ] Never commit `.env` files

## Loading Environment Variables

### Node.js/Bun Apps

```typescript
// Automatic with Bun
const mongoUri = process.env.MONGODB_URI;

// With dotenv
import dotenv from "dotenv";
dotenv.config();
```

### Python Apps

```python
import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env file
mongo_uri = os.getenv('MONGODB_URI')
```

### Docker Compose

Environment variables are loaded in two ways:

1. **env_file directive:**

   ```yaml
   services:
     apis:
       env_file:
         - .env
   ```

2. **environment section with substitution:**
   ```yaml
   environment:
     - MONGODB_URI=${MONGODB_URI}
     - PORT=${PORT:-3001} # With default value
   ```

### Vite (Frontend)

Only variables prefixed with `VITE_` are exposed:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Troubleshooting

### Variables Not Loading

1. **Check file location:** `.env` must be in the workspace root
2. **Check syntax:** Use `KEY=value` format, no spaces around `=`
3. **Restart services:** Changes require container/process restart
4. **Check Docker:** Use `docker compose config` to verify variable substitution

### Common Issues

**"Cannot connect to MongoDB"**

- Check `MONGODB_URI` format
- In Docker, use service name `mongodb` instead of `localhost`
- Verify MongoDB container is running: `docker compose ps`

**"CORS policy error"**

- Add frontend URL to `CORS_ORIGINS`
- Check protocol (http vs https)
- Verify no trailing slashes

**"Better Auth secret too short"**

- `BETTER_AUTH_SECRET` must be at least 32 characters
- Generate: `openssl rand -base64 32`

### Debugging

View effective environment variables in a container:

```bash
# All variables
docker compose exec apis env

# Specific variable
docker compose exec apis env | grep MONGODB_URI

# From within container
docker compose exec apis sh
echo $MONGODB_URI
```

## Best Practices

1. **Use `.env.example` as template** - Keep it up-to-date with all required variables
2. **Document new variables** - Add to this guide and `.env.example`
3. **Use meaningful defaults** - Make local development easy
4. **Separate concerns** - Use different `.env` files per environment (not committed)
5. **Validate on startup** - Check required variables in application code
6. **Rotate secrets regularly** - Especially in production
7. **Use secrets management** - For production, use proper secret management tools

## References

- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Better Auth Configuration](https://www.better-auth.com/docs/installation)
