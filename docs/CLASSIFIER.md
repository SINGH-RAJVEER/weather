# Classifier Service

This service provides a disaster classification API using sentence transformers to identify and categorize disaster-related text.

## Project Structure

```
classifier/
├── src/
│   └── classifier/
│       ├── __init__.py
│       ├── api/              # Flask API routes
│       ├── models/           # Model loading and inference
│       ├── utils/            # Helper utilities
│       └── config/           # Configuration and keywords
├── data/                     # Training datasets
├── models/                   # Trained model files
├── tests/                    # Unit tests
├── pyproject.toml           # Project dependencies
└── README.md
```

## Running the Service

```bash
# From the classifier directory
python -m src
```

Or with uv:

```bash
uv run python -m src
```

The service will start on `http://0.0.0.0:8000`

## Endpoints

### POST /api/is_relevant

Determines if a given text is relevant to a disaster.

- **Request Body:**
  ```json
  {
    "text": "A string containing the text to classify."
  }
  ```
- **Response:**
  ```json
  {
    "relevant": true
  }
  ```

### POST /api/classify

Classifies a given text and provides additional information.

- **Request Body:**
  ```json
  {
    "text": "A string containing the text to classify.",
    "top_n": 10
  }
  ```
- **Response:**
  ```json
  {
    "text": "The original text.",
    "predicted_label": "The predicted disaster type.",
    "similarity_scores": {
      "disaster_type_1": 0.9,
      "disaster_type_2": 0.1
    },
    "matched_keywords": ["keyword1", "keyword2"],
    "top_keywords": ["keyword1", "keyword2"],
    "relevant": true,
    "meta": {
      "top_n": 10
    }
  }
  ```

````
    ```

### GET /health

A health check endpoint.

-   **Response:**
    ```json
    {
        "status": "ok"
    }
    ```
````
