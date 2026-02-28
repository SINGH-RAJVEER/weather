"""Utility exports."""

from .database import DatabaseManager, get_db
from .relevance import check_text_relevance, is_relevant_bool
from .helpers import load_keywords_from_file, sanitize_keywords, force_kill_drivers, safe_close_driver

__all__ = [
    'DatabaseManager',
    'get_db',
    'check_text_relevance',
    'is_relevant_bool',
    'load_keywords_from_file',
    'sanitize_keywords',
    'force_kill_drivers',
    'safe_close_driver',
]
