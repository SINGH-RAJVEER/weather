"""Flask API routes for disaster classification service."""

from flask import Flask, request, jsonify
from typing import Tuple, Optional, Any

from ..models import get_classifier
from ..utils import is_related, most_relevant_keywords, matched_keywords
from ..config import DEFAULT_HOST, DEFAULT_PORT, DEFAULT_TOP_N


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    def _get_payload() -> Tuple[Optional[Tuple[str, int]], Optional[Any], Optional[int]]:
        """Extract and validate request payload."""
        data = request.get_json(silent=True) or {}
        text = data.get('text')
        if not text:
            return None, jsonify({'error': 'Missing "text" in JSON body'}), 400
        
        top_n = data.get('top_n', DEFAULT_TOP_N)
        try:
            top_n = int(top_n)
        except Exception:
            top_n = DEFAULT_TOP_N
        
        return (text, top_n), None, None
    
    @app.post('/api/is_relevant')
    def check_relevance():
        """Check if text is disaster-related."""
        payload, err, status = _get_payload()
        if err:
            return err, status
        
        text, _ = payload
        relevant = is_related(text)
        return jsonify({'relevant': bool(relevant)}), 200
    
    @app.post('/api/classify')
    def classify():
        """Classify text and return detailed analysis."""
        payload, err, status = _get_payload()
        if err:
            return err, status
        
        text, top_n = payload
        classifier = get_classifier()
        
        cls = classifier.classify(text)
        matched = matched_keywords(text)
        top_kw = most_relevant_keywords(text, top_n=top_n)
        relevant = is_related(text)
        
        result = {
            'text': text,
            'predicted_label': cls.get('predicted_label'),
            'similarity_scores': cls.get('similarity_scores'),
            'matched_keywords': matched,
            'top_keywords': top_kw,
            'relevant': bool(relevant),
            'meta': {
                'top_n': top_n
            }
        }
        return jsonify(result), 200
    
    @app.get('/health')
    def health():
        """Health check endpoint."""
        return jsonify({'status': 'ok'}), 200
    
    return app


def run_server(host: str = DEFAULT_HOST, port: int = DEFAULT_PORT, debug: bool = False):
    """Run the Flask development server."""
    app = create_app()
    app.run(host=host, port=port, debug=debug)
