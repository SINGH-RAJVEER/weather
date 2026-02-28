"""Configuration management for the scraper."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Base directories
BASE_DIR = Path(__file__).resolve().parents[3]
SRC_DIR = BASE_DIR / "src" / "scraper"
DATA_DIR = BASE_DIR / "data"
CONFIG_DIR = BASE_DIR / "config"

# Load environment variables
ROOT_DIR = BASE_DIR.parents[0]
load_dotenv(ROOT_DIR / "backend" / ".env")
load_dotenv(BASE_DIR / ".env", override=True)

# MongoDB Configuration
MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URL") or "mongodb://localhost:27017"
DB_NAME = os.getenv("DB_NAME") or os.getenv("MONGO_DB") or "weather"

# Classifier API
CLASSIFIER_URL = (os.getenv("CLASSIFIER_URL") or "http://localhost:8000").rstrip("/")

# Scraper Configuration
DEFAULT_KEYWORDS = []
BACKOFF_SECONDS = 1
MAX_BACKOFF_SECONDS = 60
STALL_TIMEOUT_SECONDS = 180

# API Configuration
DEFAULT_HOST = "0.0.0.0"
DEFAULT_PORT = 5000
