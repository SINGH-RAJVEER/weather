"""Configuration management for the classifier."""

from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parents[3]
SRC_DIR = BASE_DIR / "src" / "classifier"
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

# Model paths
MODEL_PATH = str((MODELS_DIR / "fine-tuned-model").resolve())
CSV_PATH = str((DATA_DIR / "disaster_dataset.csv").resolve())

# API Configuration
DEFAULT_HOST = "0.0.0.0"
DEFAULT_PORT = 8000
DEFAULT_TOP_N = 10

# Model thresholds
GLOBAL_SIM_CUTOFF = 0.3
MIN_SIM_CUTOFF = 0.15
QUANTILE_CUTOFF = 0.25
