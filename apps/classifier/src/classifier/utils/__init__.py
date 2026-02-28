"""Utility functions for classification and keyword matching."""

import re
from typing import List, Dict, Any
from sentence_transformers import util

from ..config.keywords import LABEL_KEYWORDS
from .models import get_classifier


def most_relevant_keywords(text: str, top_n: int = 10) -> List[Dict[str, Any]]:
    """
    Find the most relevant keywords for given text.
    
    Args:
        text: Input text
        top_n: Number of top keywords to return
        
    Returns:
        List of dictionaries with keyword, label, and score
    """
    classifier = get_classifier()
    text_emb = classifier.encode(text)
    scored_keywords = []
    
    for label, keywords_str in LABEL_KEYWORDS.items():
        keywords = [kw.strip() for kw in keywords_str.split(',')]
        for kw in keywords:
            kw_emb = classifier.encode(kw)
            score = util.cos_sim(text_emb, kw_emb).item()
            scored_keywords.append({
                'keyword': kw,
                'label': label,
                'score': score
            })
    
    scored_keywords.sort(key=lambda x: x['score'], reverse=True)
    return scored_keywords[:top_n]


def matched_keywords(text: str) -> List[Dict[str, Any]]:
    """
    Find keywords that directly match in the text.
    
    Args:
        text: Input text
        
    Returns:
        List of matched keywords with scores
    """
    classifier = get_classifier()
    text_lower = text.lower()
    text_clean = re.sub(r'[^\w\s]', ' ', text_lower)
    matched = []
    
    for label, keywords_str in LABEL_KEYWORDS.items():
        keywords = [kw.strip().lower() for kw in keywords_str.split(',')]
        for kw in keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_clean) or kw in text_clean:
                kw_emb = classifier.encode(kw)
                text_emb = classifier.encode(text)
                score = util.cos_sim(text_emb, kw_emb).item()
                matched.append({
                    'keyword': kw,
                    'label': label,
                    'score': score
                })
    
    matched.sort(key=lambda x: x['score'], reverse=True)
    return matched


def is_related(text: str) -> bool:
    """
    Check if text is related to disasters.
    
    Args:
        text: Input text
        
    Returns:
        True if text is disaster-related, False otherwise
    """
    classifier = get_classifier()
    embedding = classifier.encode([text])[0]
    similarities = [
        util.cos_sim(embedding, centroid).item() 
        for centroid in classifier.label_centroids.values()
    ]
    
    max_similarity = max(similarities) if similarities else 0
    matched = matched_keywords(text)
    
    # Direct similarity check
    if max_similarity >= classifier.global_sim_cutoff:
        return True
    
    # Contextual check with matched keywords
    elif max_similarity >= classifier.global_sim_cutoff * 0.7 and matched:
        contextual_scores = [item['score'] for item in matched]
        avg_context_score = sum(contextual_scores) / len(contextual_scores) if contextual_scores else 0
        return avg_context_score > 0.5
    
    return False
