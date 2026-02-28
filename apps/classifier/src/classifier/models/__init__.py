"""Model loading and inference for disaster classification."""

from sentence_transformers import SentenceTransformer, util
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

from ..config import MODEL_PATH, CSV_PATH, GLOBAL_SIM_CUTOFF, MIN_SIM_CUTOFF, QUANTILE_CUTOFF
from ..config.keywords import LABEL_KEYWORDS


class DisasterClassifier:
    """Main classifier for disaster-related text."""
    
    def __init__(self):
        """Initialize the classifier with model and data."""
        self.model = SentenceTransformer(MODEL_PATH)
        self.df = pd.read_csv(CSV_PATH)
        self.labels = self.df['label'].unique()
        self.label_map = {idx: label for idx, label in enumerate(self.labels)}
        self.label_keywords = LABEL_KEYWORDS
        self.label_centroids: Dict[int, Any] = {}
        self.global_sim_cutoff = GLOBAL_SIM_CUTOFF
        
        self._compute_centroids()
        self._compute_similarity_threshold()
    
    def _compute_centroids(self):
        """Compute centroid embeddings for each label."""
        for idx, label in enumerate(self.labels):
            texts = self.df[self.df['label'] == label]['text'].tolist()
            if texts:
                embeddings = self.model.encode(texts)
                centroid = embeddings.mean(axis=0)
                self.label_centroids[idx] = centroid
    
    def _compute_similarity_threshold(self):
        """Compute adaptive similarity threshold based on training data."""
        try:
            self_sims = []
            for idx, label in enumerate(self.labels):
                texts = self.df[self.df['label'] == label]['text'].tolist()
                if not texts:
                    continue
                embs = self.model.encode(texts)
                centroid = self.label_centroids.get(idx)
                if centroid is None:
                    continue
                sims = util.cos_sim(embs, centroid).cpu().numpy().reshape(-1)
                self_sims.extend(sims.tolist())
            
            if self_sims:
                self.global_sim_cutoff = float(np.quantile(self_sims, QUANTILE_CUTOFF))
                self.global_sim_cutoff = max(self.global_sim_cutoff, MIN_SIM_CUTOFF)
            else:
                self.global_sim_cutoff = GLOBAL_SIM_CUTOFF
        except Exception:
            self.global_sim_cutoff = GLOBAL_SIM_CUTOFF
    
    def classify(self, text: str) -> Dict[str, Any]:
        """
        Classify text into disaster categories.
        
        Args:
            text: Input text to classify
            
        Returns:
            Dictionary with predicted label and similarity scores
        """
        embedding = self.model.encode([text])[0]
        similarities = {
            idx: util.cos_sim(embedding, centroid).item() 
            for idx, centroid in self.label_centroids.items()
        }
        best_idx = max(similarities, key=similarities.get)
        
        return {
            'text': text,
            'predicted_label': self.label_map[best_idx],
            'similarity_scores': {
                self.label_map[idx]: score 
                for idx, score in similarities.items()
            }
        }
    
    def encode(self, text: str):
        """Encode text into embedding vector."""
        return self.model.encode(text)


# Global classifier instance
_classifier: Optional[DisasterClassifier] = None


def get_classifier() -> DisasterClassifier:
    """Get or create the global classifier instance."""
    global _classifier
    if _classifier is None:
        _classifier = DisasterClassifier()
    return _classifier
