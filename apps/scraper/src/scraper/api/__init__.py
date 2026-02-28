"""Flask API routes for scraper service."""

import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import List, Dict, Any, Optional

from ..manager import get_scraper
from ..utils import get_db, sanitize_keywords, check_text_relevance, load_keywords_from_file
from ..config import DEFAULT_HOST, DEFAULT_PORT, BASE_DIR


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)
    CORS(app)
    
    scraper = get_scraper()
    db = get_db()
    
    # Load default keywords
    default_keywords = load_keywords_from_file(BASE_DIR / "data" / "keywords.json")
    
    def _parse_keywords(req) -> List[str]:
        """Parse keywords from request."""
        if req.is_json:
            data = req.get_json(silent=True) or {}
            kws = data.get("keywords")
            if isinstance(kws, list):
                return [str(k).strip() for k in kws if str(k).strip()]
        
        qs = req.args.get("keywords", "")
        if qs:
            return [k.strip() for k in qs.split(",") if k.strip()]
        
        return default_keywords
    
    @app.route('/scrape', methods=['GET', 'POST'])
    def scrape():
        """Start scraping with provided keywords."""
        keywords_list = sanitize_keywords(_parse_keywords(request))
        print(f"Parsed keywords: {keywords_list}")
        
        if not keywords_list:
            return jsonify({
                'error': 'No keywords provided',
                'hint': 'Send JSON {"keywords": ["cyclone","flood"]} or use ?keywords=cyclone,flood'
            }), 400
        
        if scraper.is_running:
            return jsonify({'error': 'Scraping already running'}), 400
        
        try:
            scraper.start_scraping(keywords_list)
            return jsonify({'message': 'Scraping started', 'keywords': keywords_list}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to start scraping: {str(e)}'}), 500
    
    @app.route('/start', methods=['POST'])
    def start_scraping():
        """Start scraping endpoint."""
        if scraper.is_running:
            return jsonify({'error': 'Scraping already running'}), 400
        
        keywords_list = sanitize_keywords(_parse_keywords(request))
        if not keywords_list:
            return jsonify({'error': 'No keywords provided'}), 400
        
        scraper.start_scraping(keywords_list)
        return jsonify({'message': 'Scraping started', 'keywords': keywords_list}), 200
    
    @app.route('/stop', methods=['POST'])
    def stop_scraping():
        """Stop scraping endpoint."""
        if not scraper.is_running:
            return jsonify({'error': 'Scraping is not running'}), 400
        
        scraper.stop_scraping()
        return jsonify({'message': 'Scraping stopped'}), 200
    
    @app.route('/restart', methods=['POST'])
    def restart():
        """Restart scraping with optional new keywords."""
        kws = sanitize_keywords(_parse_keywords(request))
        ok, msg = scraper.restart_scraper(kws if kws else None)
        status = 200 if ok else 400
        return jsonify({'message': msg, 'keywords': scraper.latest_keywords}), status
    
    @app.route('/status', methods=['GET'])
    def status():
        """Get scraper status."""
        return jsonify(scraper.get_status())
    
    @app.route('/results', methods=['GET'])
    def get_results():
        """Get scraping results from database."""
        keyword = request.args.get('keyword')
        keywords_csv = request.args.get('keywords')
        limit = int(request.args.get('limit', '10'))
        
        if keyword:
            data = db.fetch_tweets(keyword=keyword, limit=limit)
            return jsonify(data)
        
        if keywords_csv:
            kws = [k.strip() for k in keywords_csv.split(',') if k.strip()]
            groups = {}
            for kw in kws:
                groups[kw] = db.fetch_tweets(keyword=kw, limit=limit)
            return jsonify(groups)
        
        # Return processed in-memory results
        raw_results = scraper.get_results()
        processed_results = {}
        
        for category, texts in raw_results.items():
            processed_results[category] = []
            for text in texts:
                if text and str(text).strip():
                    relevance_result = check_text_relevance(str(text))
                    processed_results[category].append(relevance_result)
        
        return jsonify(processed_results)
    
    @app.route('/results/raw', methods=['GET'])
    def get_raw_results():
        """Get raw in-memory results."""
        return jsonify(scraper.get_results())
    
    @app.route('/tweets/relevant', methods=['GET'])
    def get_relevant_tweets():
        """Get relevant tweets from database."""
        if not db.enabled:
            return jsonify([])
        
        kws = sanitize_keywords(_parse_keywords(request))
        limit = request.args.get('limit', '20')
        try:
            limit_i = max(1, min(100, int(limit)))
        except Exception:
            limit_i = 20
        
        # Fetch relevant tweets
        tweets = db.fetch_tweets(keywords=kws if kws else None, limit=limit_i, relevant_only=True)
        
        # If no results and recompute requested, backfill
        if not tweets:
            recompute = (request.args.get('recompute') or '').lower() in ('1', 'true', 'yes')
            if recompute and db.enabled:
                # Fetch recent tweets and classify them
                recent = db.fetch_tweets(keywords=kws if kws else None, limit=limit_i)
                relevant_tweets = []
                
                for tweet in recent:
                    text = tweet.get('text', '')
                    if text:
                        result = check_text_relevance(text)
                        relevant = bool(result.get('relevant', False))
                        if relevant:
                            tweet['relevant'] = True
                            relevant_tweets.append(tweet)
                
                tweets = relevant_tweets
        
        return jsonify(tweets)
    
    @app.route('/health', methods=['GET'])
    def health():
        """Health check endpoint."""
        return jsonify({
            'status': 'ok',
            'is_running': scraper.is_running,
            'db_enabled': db.enabled
        })
    
    return app


def run_server(host: str = DEFAULT_HOST, port: int = DEFAULT_PORT, debug: bool = True):
    """Run the Flask development server."""
    app = create_app()
    print(f"Starting Flask server on http://{host}:{port}")
    app.run(host=host, port=port, debug=debug)
