# Classifier API

This directory contains a Flask API for classifying text related to disasters.

## Endpoints

### POST /api/is_relevant

Determines if a given text is relevant to a disaster.

-   **Request Body:**
    ```json
    {
        "text": "A string containing the text to classify."
    }
    ```
-   **Response:**
    ```json
    {
        "relevant": true
    }
    ```

### POST /api/classify

Classifies a given text and provides additional information.

-   **Request Body:**
    ```json
    {
        "text": "A string containing the text to classify.",
        "top_n": 10
    }
    ```
-   **Response:**
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

### GET /health

A health check endpoint.

-   **Response:**
    ```json
    {
        "status": "ok"
    }
    ```