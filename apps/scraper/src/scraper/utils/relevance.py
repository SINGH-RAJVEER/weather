"""Relevance checking utilities using classifier API."""

import requests
from typing import Dict, Any

from ..config import CLASSIFIER_URL


def check_text_relevance(text: str, classifier_url: str = None) -> Dict[str, Any]:
    """
    Check if text is disaster-relevant using classifier API.
    
    Args:
        text: Text to check
        classifier_url: Optional custom classifier URL
        
    Returns:
        Dictionary with text and relevant boolean
    """
    url = (classifier_url or CLASSIFIER_URL).rstrip("/")
    
    try:
        response = requests.post(
            f"{url}/api/is_relevant",
            json={"text": text},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                'text': text,
                'relevant': result.get('relevant', False)
            }
        else:
            print(f"API error: {response.status_code} - {response.text}")
            return {'text': text, 'relevant': False}
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return {'text': text, 'relevant': False}


def is_relevant_bool(text: str) -> bool:
    """
    Simple boolean check for text relevance.
    
    Args:
        text: Text to check
        
    Returns:
        True if relevant, False otherwise
    """
    result = check_text_relevance(text)
    try:
        return bool(result.get('relevant', False))
    except Exception:
        return False
