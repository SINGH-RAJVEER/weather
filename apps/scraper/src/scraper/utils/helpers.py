"""Helper utilities for the scraper."""

import json
import subprocess
from pathlib import Path
from typing import List


def load_keywords_from_file(file_path: Path) -> List[str]:
    """
    Load keywords from JSON file.
    
    Args:
        file_path: Path to keywords JSON file
        
    Returns:
        List of keyword strings
    """
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
            if isinstance(data, dict) and isinstance(data.get("keywords"), list):
                return [str(kw).strip() for kw in data["keywords"] if str(kw).strip()]
    except Exception as e:
        print(f"[keywords] failed to load: {e}")
    return []


def sanitize_keywords(keywords: List[str], max_count: int = 50, max_length: int = 64) -> List[str]:
    """
    Sanitize and deduplicate keywords.
    
    Args:
        keywords: List of raw keywords
        max_count: Maximum number of keywords to return
        max_length: Maximum length of each keyword
        
    Returns:
        Cleaned and deduplicated list of keywords
    """
    seen, out = set(), []
    for k in keywords:
        k2 = k.strip()
        if not k2 or len(k2) > max_length:
            continue
        lk = k2.lower()
        if lk in seen:
            continue
        seen.add(lk)
        out.append(k2)
        if len(out) >= max_count:
            break
    return out


def force_kill_drivers():
    """Force kill Chrome and ChromeDriver processes (Windows)."""
    try:
        subprocess.run(["taskkill", "/F", "/IM", "chromedriver.exe", "/T"], capture_output=True)
        subprocess.run(["taskkill", "/F", "/IM", "chrome.exe", "/T"], capture_output=True)
    except Exception:
        pass


def safe_close_driver(wrapper):
    """Safely close Selenium driver wrapper."""
    try:
        if wrapper:
            wrapper.close()
    except Exception:
        pass
    finally:
        force_kill_drivers()
