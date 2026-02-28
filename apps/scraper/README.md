# Scraper Service

This service provides a Twitter scraping API for disaster-related content with automated relevance classification.

## Project Structure

```
scraper/
├── src/
│   └── scraper/
│       ├── __init__.py
│       ├── api/              # Flask API routes
│       ├── spiders/          # Scrapy spiders for web scraping
│       ├── utils/            # Database, relevance checking, helpers
│       ├── config/           # Configuration management
│       └── manager.py        # Scraping orchestration and lifecycle
├── data/                     # Keywords and data files
├── tests/                    # Unit tests
├── scrapy.cfg               # Scrapy configuration
├── pyproject.toml           # Project dependencies
└── README.md
```

## Running the Service

```bash
# From the scraper directory
python -m src
```

Or with uv:
```bash
uv run python -m src
```

The service will start on `http://0.0.0.0:5000` (configurable via `PORT` env variable)

## Configuration

### Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGODB_URI` / `MONGO_URL`: MongoDB connection string
- `DB_NAME` / `MONGO_DB`: Database name (default: "weather")
- `CLASSIFIER_URL`: URL of classifier service (default: http://localhost:8000)

## API Endpoints

### POST/GET `/scrape`

Starts the scraping process.

**Parameters:**
- `keywords`: (Optional) List of keywords. Can be JSON body `{"keywords": ["cyclone", "flood"]}` or query param `?keywords=cyclone,flood`.

**Returns:**
- `200 OK`: Scraping started successfully
- `400 Bad Request`: No keywords provided or scraper already running
- `500 Internal Server Error`: Failed to start scraper

### POST `/start`

Starts the scraping process (alias for `/scrape`).

**Parameters:** Same as `/scrape`

**Returns:** Same as `/scrape`

### POST `/stop`

Stops the currently running scraping process.

**Returns:**
- `200 OK`: Scraping stopped successfully
- `400 Bad Request`: Scraper is not running

### POST `/restart`

Restarts the scraper with optional new keywords.

**Parameters:**
- `keywords`: (Optional) New keywords to scrape. Uses previous keywords if not provided.

**Returns:**
- `200 OK`: Scraper restarted successfully
- `400 Bad Request`: No keywords available to restart with

### GET `/status`

Returns the current status of the scraper.

**Returns:**
```json
{
  "is_running": true,
  "thread_alive": true,
  "last_progress_age_sec": 10.5,
  "keywords": ["cyclone", "flood"]
}
```

### GET `/results`

Returns scraping results from database.

**Parameters:**
- `keyword`: (Optional) Single keyword to filter
- `keywords`: (Optional) Comma-separated keywords
- `limit`: (Optional) Max results per keyword (default: 10)

**Returns:** JSON object with results grouped by keyword

### GET `/results/raw`

Returns raw, unprocessed in-memory scraping results.

**Returns:** JSON object with raw results

### GET `/tweets/relevant`

Returns tweets marked as disaster-relevant.

**Parameters:**
- `keywords`: (Optional) Comma-separated keywords to filter
- `limit`: (Optional) Max tweets to return (default: 20, max: 100)
- `recompute`: (Optional) If `1`/`true`/`yes`, reclassify recent tweets if none found

**Returns:** JSON array of relevant tweet objects

### GET `/health`

Health check endpoint.

**Returns:**
```json
{
  "status": "ok",
  "is_running": false,
  "db_enabled": true
}
```

## Architecture

The scraper uses:
- **Flask** for REST API
- **Selenium/undetected-chromedriver** for web scraping
- **MongoDB** for storing scraped tweets
- **Threading** for background scraping operations
- **Classifier API** integration for relevance detection

## Development

To add new spiders, place them in `src/scraper/spiders/` and import in the manager.

To modify scraping behavior, edit `src/scraper/manager.py`.
