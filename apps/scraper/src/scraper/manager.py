"""Scraping manager for coordinating scraping operations."""

import time
import random
from threading import Thread, Event, Lock
from typing import List, Dict, Optional, Any
from selenium.common.exceptions import (
    NoSuchWindowException,
    WebDriverException,
    TimeoutException,
    NoSuchElementException
)

from .spiders.twitter_spider import XcancelScraper
from .utils import get_db, is_relevant_bool, safe_close_driver
from .config import BACKOFF_SECONDS, MAX_BACKOFF_SECONDS, STALL_TIMEOUT_SECONDS


class ScraperManager:
    """Manages the scraping lifecycle and thread coordination."""
    
    def __init__(self):
        """Initialize scraper manager."""
        self.stop_event = Event()
        self.scraping_thread: Optional[Thread] = None
        self.supervisor_thread: Optional[Thread] = None
        self.is_running = False
        self.results: Dict[str, List] = {}
        self.latest_keywords: List[str] = []
        self.last_progress_ts: float = 0.0
        self.restart_lock = Lock()
        self.backoff_seconds = BACKOFF_SECONDS
        self.db = get_db()
    
    def _touch_progress(self):
        """Update last progress timestamp."""
        self.last_progress_ts = time.time()
    
    def start_scraping(self, keywords: List[str]) -> bool:
        """
        Start scraping with given keywords.
        
        Args:
            keywords: List of keywords to scrape
            
        Returns:
            True if started successfully
        """
        if self.is_running:
            return False
        
        self.latest_keywords = keywords[:]
        self.stop_event.clear()
        self.results.clear()
        self.is_running = True
        self.backoff_seconds = BACKOFF_SECONDS
        
        self.scraping_thread = Thread(
            target=self._scraping_loop,
            args=(self.latest_keywords,),
            daemon=True
        )
        self.scraping_thread.start()
        self._ensure_supervisor()
        return True
    
    def stop_scraping(self) -> bool:
        """
        Stop scraping operations.
        
        Returns:
            True if stopped successfully
        """
        if not self.is_running:
            return False
        
        self.stop_event.set()
        self.is_running = False
        
        if self.scraping_thread and self.scraping_thread.is_alive():
            self.scraping_thread.join(timeout=5)
        
        return True
    
    def restart_scraper(self, keywords: Optional[List[str]] = None) -> tuple[bool, str]:
        """
        Restart scraper with optional new keywords.
        
        Args:
            keywords: Optional new keywords, uses latest if not provided
            
        Returns:
            Tuple of (success, message)
        """
        with self.restart_lock:
            kw = keywords if keywords else self.latest_keywords
            if not kw:
                return False, "No keywords to restart"
            
            self.stop_scraping()
            self.start_scraping(kw)
            return True, "Restarted"
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get current scraper status.
        
        Returns:
            Status dictionary
        """
        return {
            'is_running': self.is_running,
            'thread_alive': bool(self.scraping_thread and self.scraping_thread.is_alive()),
            'last_progress_age_sec': (
                None if not self.last_progress_ts 
                else round(time.time() - self.last_progress_ts, 1)
            ),
            'keywords': self.latest_keywords
        }
    
    def get_results(self) -> Dict[str, List]:
        """Get current scraping results."""
        return self.results.copy()
    
    def _ensure_supervisor(self):
        """Ensure supervisor thread is running."""
        if self.supervisor_thread and self.supervisor_thread.is_alive():
            return
        self.supervisor_thread = Thread(target=self._supervisor_loop, daemon=True)
        self.supervisor_thread.start()
    
    def _supervisor_loop(self):
        """Monitor scraping and restart if stalled."""
        while True:
            time.sleep(10)
            if not self.is_running:
                continue
            
            stalled = (
                (time.time() - self.last_progress_ts) > STALL_TIMEOUT_SECONDS 
                if self.last_progress_ts else False
            )
            dead = not (self.scraping_thread and self.scraping_thread.is_alive())
            
            if stalled or dead:
                print(f"[supervisor] Detected {'stall' if stalled else 'dead thread'} -> restarting")
                ok, msg = self.restart_scraper()
                print(f"[supervisor] {msg}")
    
    def _scraping_loop(self, keywords: List[str]):
        """
        Main scraping loop.
        
        Args:
            keywords: Keywords to scrape
        """
        wrapper = None
        try:
            while not self.stop_event.is_set():
                if wrapper is None:
                    try:
                        wrapper = XcancelScraper()
                        self.backoff_seconds = BACKOFF_SECONDS
                    except Exception as e:
                        print(f"[scraper] init error: {e}; retrying in {self.backoff_seconds}s")
                        time.sleep(self.backoff_seconds + random.uniform(0, 0.5))
                        self.backoff_seconds = min(MAX_BACKOFF_SECONDS, self.backoff_seconds * 2)
                        continue
                
                for keyword in keywords:
                    if self.stop_event.is_set():
                        break
                    if wrapper is None:
                        break
                    
                    try:
                        print(f"Searching for keyword: {keyword}")
                        self._touch_progress()
                        tweets = wrapper.search_and_extract(keyword)
                        
                        self.results[keyword] = tweets[:5] if isinstance(tweets, list) else []
                        
                        if isinstance(tweets, list) and self.db.enabled:
                            for item in tweets:
                                text = ""
                                if isinstance(item, dict):
                                    text = (item.get("text") or "").strip()
                                else:
                                    text = (str(item) or "").strip()
                                
                                if not text:
                                    continue
                                
                                relevant = is_relevant_bool(text)
                                self.db.upsert_tweet(keyword, text, relevant)
                        
                        self._touch_progress()
                        time.sleep(0.5)
                        
                    except NoSuchElementException as e:
                        print(f"[scraper] no results for '{keyword}': {e}")
                        self._touch_progress()
                        time.sleep(0.3)
                        continue
                        
                    except (NoSuchWindowException, TimeoutException) as e:
                        print(f"[scraper] window/timeout for '{keyword}': {e}")
                        safe_close_driver(wrapper)
                        wrapper = None
                        time.sleep(1 + random.uniform(0, 0.5))
                        break
                        
                    except WebDriverException as e:
                        print(f"[scraper] WebDriverException: {e}")
                        safe_close_driver(wrapper)
                        wrapper = None
                        time.sleep(self.backoff_seconds + random.uniform(0, 0.5))
                        self.backoff_seconds = min(MAX_BACKOFF_SECONDS, self.backoff_seconds * 2)
                        break
                        
                    except Exception as e:
                        print(f"[scraper] loop error for '{keyword}': {e}")
                        safe_close_driver(wrapper)
                        wrapper = None
                        time.sleep(1 + random.uniform(0, 0.5))
                        break
                
                time.sleep(1)
        finally:
            safe_close_driver(wrapper)
            self.is_running = False
            print("Scraping stopped and driver closed.")


# Global scraper instance
_scraper_manager: Optional[ScraperManager] = None


def get_scraper() -> ScraperManager:
    """Get or create the global scraper instance."""
    global _scraper_manager
    if _scraper_manager is None:
        _scraper_manager = ScraperManager()
    return _scraper_manager
