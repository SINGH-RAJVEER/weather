"""Database utilities for MongoDB operations."""

from pymongo import MongoClient
from pymongo.errors import PyMongoError
from datetime import datetime, timezone
import hashlib
from typing import Optional, List, Dict, Any

from ..config import MONGODB_URI, DB_NAME


class DatabaseManager:
    """Manages MongoDB connections and operations."""
    
    def __init__(self):
        """Initialize database connection."""
        self.client = None
        self.db = None
        self.tweets_col = None
        self.enabled = False
        self._connect()
    
    def _connect(self):
        """Establish connection to MongoDB."""
        try:
            self.client = MongoClient(MONGODB_URI)
            self.client.admin.command("ping")
            print(f"[mongo] connected to {MONGODB_URI}")
            
            self.db = self.client[DB_NAME]
            self.tweets_col = self.db["tweets"]
            
            # Create indexes
            self.tweets_col.create_index([("keyword", 1), ("text_sha1", 1)], unique=True)
            self.tweets_col.create_index([("keyword", 1), ("inserted_at", -1)])
            
            self.enabled = True
        except Exception as e:
            self.enabled = False
            print(f"[mongo] connection failed: {e}")
    
    def upsert_tweet(self, keyword: str, text: str, relevant: bool) -> bool:
        """
        Insert or update a tweet in the database.
        
        Args:
            keyword: Search keyword
            text: Tweet text
            relevant: Whether tweet is disaster-relevant
            
        Returns:
            True if successful, False otherwise
        """
        if not self.enabled or not self.tweets_col:
            return False
        
        try:
            text_sha1 = self._sha1(f"{keyword}|{text}")
            now_iso = self._now_iso()
            
            self.tweets_col.update_one(
                {"keyword": keyword, "text_sha1": text_sha1},
                {
                    "$setOnInsert": {
                        "keyword": keyword,
                        "text": text,
                        "text_sha1": text_sha1,
                        "inserted_at": now_iso,
                    },
                    "$set": {
                        "relevant": relevant,
                    },
                },
                upsert=True,
            )
            return True
        except PyMongoError as e:
            print(f"[DB upsert] error for '{keyword}': {e}")
            return False
    
    def fetch_tweets(
        self, 
        keyword: Optional[str] = None, 
        keywords: Optional[List[str]] = None,
        limit: int = 10,
        relevant_only: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Fetch tweets from database.
        
        Args:
            keyword: Single keyword to filter
            keywords: Multiple keywords to filter
            limit: Maximum number of results
            relevant_only: Only return relevant tweets
            
        Returns:
            List of tweet documents
        """
        if not self.enabled or not self.tweets_col:
            return []
        
        try:
            query = {}
            if keyword:
                query["keyword"] = keyword
            elif keywords:
                query["keyword"] = {"$in": keywords}
            
            if relevant_only:
                query["relevant"] = True
            
            docs = list(
                self.tweets_col.find(query)
                .sort([("inserted_at", -1)])
                .limit(limit)
            )
            
            return [
                {
                    "keyword": d.get("keyword", ""),
                    "text": d.get("text", ""),
                    "relevant": bool(d.get("relevant", False)),
                    "inserted_at": d.get("inserted_at"),
                }
                for d in docs
            ]
        except Exception as e:
            print(f"[DB fetch] error: {e}")
            return []
    
    def update_relevance(self, doc_id, relevant: bool) -> bool:
        """Update relevance field for a document."""
        if not self.enabled or not self.tweets_col:
            return False
        
        try:
            self.tweets_col.update_one(
                {"_id": doc_id},
                {"$set": {"relevant": relevant}},
            )
            return True
        except PyMongoError as e:
            print(f"[DB update] error: {e}")
            return False
    
    @staticmethod
    def _now_iso() -> str:
        """Get current time as ISO string."""
        return datetime.now(timezone.utc).isoformat()
    
    @staticmethod
    def _sha1(text: str) -> str:
        """Compute SHA1 hash of text."""
        return hashlib.sha1(text.encode("utf-8")).hexdigest()


# Global database instance
_db_manager: Optional[DatabaseManager] = None


def get_db() -> DatabaseManager:
    """Get or create the global database instance."""
    global _db_manager
    if _db_manager is None:
        _db_manager = DatabaseManager()
    return _db_manager
