# Scraper API

This document provides an overview of the API endpoints for the scraper service.

## Configuration

### Port

The application runs on port `5001` by default. You can change the port by setting the `PORT` environment variable.

## Endpoints

### `/scrape`

*   **Description:** Starts the scraping process. If no keywords are provided, it will use the default list from `public/keywords.json`.
*   **Parameters:**
    *   `keywords`: (Optional) A list of keywords to search for. Can be provided as a JSON body `{"keywords": ["keyword1", "keyword2"]}` or as a comma-separated query parameter `?keywords=keyword1,keyword2`.
*   **Returns:**
    *   `200 OK`: If the scraping process was started successfully.
    *   `400 Bad Request`: If no keywords are provided or if the scraper is already running.
    *   `500 Internal Server Error`: If there was an error starting the scraper.

### `/restart`

*   **Method:** `POST`
*   **Description:** Restarts the scraper. If new keywords are provided, the scraper will restart with the new keywords. Otherwise, it will use the previous keywords.
*   **Parameters:**
    *   `keywords`: (Optional) A list of keywords to search for. Can be provided as a JSON body `{"keywords": ["keyword1", "keyword2"]}` or as a comma-separated query parameter `?keywords=keyword1,keyword2`.
*   **Returns:**
    *   `200 OK`: If the scraper was restarted successfully.
    *   `400 Bad Request`: If there are no keywords to restart with.

### `/status`

*   **Method:** `GET`
*   **Description:** Returns the current status of the scraper.
*   **Returns:** A JSON object with the following fields:
    *   `is_running`: A boolean indicating if the scraper is currently running.
    *   `thread_alive`: A boolean indicating if the scraping thread is alive.
    *   `last_progress_age_sec`: The age of the last progress update in seconds.
    *   `keywords`: The list of keywords being scraped.

### `/start`

*   **Method:** `POST`
*   **Description:** Starts the scraping process. If no keywords are provided, it will use the default list from `public/keywords.json`.
*   **Parameters:**
    *   `keywords`: (Optional) A list of keywords to search for. Can be provided as a JSON body `{"keywords": ["keyword1", "keyword2"]}` or as a comma-separated query parameter `?keywords=keyword1,keyword2`.
*   **Returns:**
    *   `200 OK`: If the scraping process was started successfully.
    *   `400 Bad Request`: If no keywords are provided or if the scraper is already running.

### `/results`

*   **Method:** `GET`
*   **Description:** Returns the processed scraping results.
*   **Parameters:**
    *   `keyword`: (Optional) A single keyword to get results for.
    *   `keywords`: (Optional) A comma-separated list of keywords to get results for.
    *   `limit`: (Optional) The maximum number of results to return per keyword. Defaults to 10.
*   **Returns:** A JSON object containing the processed results. If `keyword` or `keywords` are provided, it returns results for the specified keywords. Otherwise, it returns all processed results.

### `/results/raw`

*   **Method:** `GET`
*   **Description:** Returns the raw, unprocessed scraping results.
*   **Returns:** A JSON object containing the raw results.

### `/stop`

*   **Method:** `POST`
*   **Description:** Stops the scraping process.
*   **Returns:**
    *   `200 OK`: If the scraping process was stopped successfully.
    *   `400 Bad Request`: If the scraper is not running.

### `/health`

*   **Method:** `GET`
*   **Description:** Health check endpoint.
*   **Returns:** A JSON object with the status of the service.

### `/tweets/relevant`

*   **Method:** `GET`
*   **Description:** Returns a flat list of tweets that have been marked as relevant.
*   **Parameters:**
    *   `keywords`: (Optional) A comma-separated list of keywords to filter the tweets by.
    *   `limit`: (Optional) The maximum number of tweets to return. Defaults to 20.
    *   `recompute`: (Optional) If set to `1`, `true`, or `yes`, it will re-classify recent tweets if no relevant tweets are found.
*   **Returns:** A JSON array of relevant tweet objects.
