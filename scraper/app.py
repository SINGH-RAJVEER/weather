from flask import Flask, request, jsonify
from flask_cors import CORS
from threading import Thread, Event
from twitter_scraper.spiders.twitter_spider import XcancelScraper
import time
import threading
import requests
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from datetime import datetime, timezone
import hashlib
import os
from dotenv import load_dotenv
from pathlib import Path
from selenium.common.exceptions import NoSuchWindowException,WebDriverException,TimeoutException,NoSuchElementException
import re
import random
import subprocess
import json

app = Flask(__name__)
CORS(app)

stop_event = Event()
scraping_thread = None
is_running = False
results = {}
supervisor_thread = None
latest_keywords: list[str] = []
last_progress_ts: float = 0.0
restart_lock = threading.Lock()
BACKOFF_SECONDS = 1
MAX_BACKOFF_SECONDS = 60
STALL_TIMEOUT_SECONDS = 180
DEFAULT_KEYWORDS = []

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / "backend" / ".env")
load_dotenv(ROOT_DIR / "scraper" / ".env", override=True)

MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URL") or "mongodb://localhost:27017"
DB_NAME = os.getenv("DB_NAME") or os.getenv("MONGO_DB") or "shore"
CLASSIFIER_URL = (os.getenv("CLASSIFIER_URL") or "http://localhost:8000").rstrip("/")

mongo_client = MongoClient(MONGODB_URI)
DB_ENABLED=True
try:
    mongo_client.admin.command("ping")
    print(f"[mongo] connected to {MONGODB_URI}")
except Exception as e:
    DB_ENABLED=False
    print(f"[mongo] connection failed: {e}")

if DB_ENABLED:
    db = mongo_client[DB_NAME]
    tweets_col = db["tweets"]
    try:
        tweets_col.create_index([("keyword", 1), ("text_sha1", 1)], unique=True)
        tweets_col.create_index([("keyword", 1), ("inserted_at", -1)])
    except Exception:
        pass
else:
    db = None
    tweets_col = None

def _touch_progress():
    global last_progress_ts
    last_progress_ts=time.time()

def _force_kill_drivers():
    try:
        subprocess.run(["taskkill", "/F", "/IM", "chromedriver.exe", "/T"], capture_output=True)
        subprocess.run(["taskkill", "/F", "/IM", "chrome.exe", "/T"], capture_output=True)
    except Exception:
        pass

def _safe_close(wrapper):
    try:
        if wrapper:
            wrapper.close()
    except Exception:
        pass
    finally:
        _force_kill_drivers()

def start_scraping_thread(keywords:list[str]):
    global scraping_thread, is_running, latest_keywords, BACKOFF_SECONDS
    latest_keywords = keywords[:]
    stop_event.clear()
    results.clear()
    is_running = True
    BACKOFF_SECONDS = 1
    scraping_thread = Thread(target=scraping_loop, args=(latest_keywords,), daemon=True)
    scraping_thread.start()
    _ensure_supervisor()

def stop_scraping_internal():
    global is_running, scraping_thread
    stop_event.set()
    is_running = False
    if scraping_thread and scraping_thread.is_alive():
        scraping_thread.join(timeout=5)

def restart_scraper(keywords: list[str] | None = None):
    with restart_lock:
        kw = keywords if keywords else latest_keywords
        if not kw:
            return False, "No keywords to restart"
        stop_scraping_internal()
        start_scraping_thread(kw)
        return True, "Restarted"

def _ensure_supervisor():
    global supervisor_thread
    if supervisor_thread and supervisor_thread.is_alive():
        return
    supervisor_thread = Thread(target=_supervisor_loop, daemon=True)
    supervisor_thread.start()

def _supervisor_loop():
    while True:
        time.sleep(10)
        if not is_running:
            continue
        stalled = (time.time() - last_progress_ts) > STALL_TIMEOUT_SECONDS if last_progress_ts else False
        dead = not (scraping_thread and scraping_thread.is_alive())
        if stalled or dead:
            print(f"[supervisor] Detected {'stall' if stalled else 'dead thread'} -> restarting scraper")
            ok, msg = restart_scraper()
            print(f"[supervisor] {msg}")
def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def _sha1(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8")).hexdigest()


def check_text_relevance(text, classifier_url=None):
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
    rr = check_text_relevance(text)
    try:
        return bool(rr.get('relevant', False))
    except Exception:
        return False
    

def scraping_loop(keywords):
    global is_running, results, BACKOFF_SECONDS
    wrapper = None
    try:
        while not stop_event.is_set():
            if wrapper is None:
                try:
                    wrapper = XcancelScraper()
                    BACKOFF_SECONDS = 1  
                except Exception as e:
                    print(f"[scraper] init error: {e}; retrying in {BACKOFF_SECONDS}s")
                    time.sleep(BACKOFF_SECONDS + random.uniform(0, 0.5))  # jitter
                    BACKOFF_SECONDS = min(MAX_BACKOFF_SECONDS, BACKOFF_SECONDS * 2)
                    continue

            for keyword in keywords:
                if stop_event.is_set():
                    break
                if wrapper is None:
                    break
                try:
                    print(f"Searching for keyword: {keyword}")
                    _touch_progress()
                    tweets = wrapper.search_and_extract(keyword)

                    results[keyword] = tweets[:5] if isinstance(tweets, list) else []

                    if isinstance(tweets, list) and DB_ENABLED and (tweets_col is not None):
                        for item in tweets:
                            if isinstance(item, dict):
                                text = (item.get("text") or "").strip()
                                source_raw = item
                            else:
                                text = (str(item) or "").strip()
                                source_raw = {"text": text}
                            if not text:
                                continue

                            relevant_bool = is_relevant_bool(text)
                            now_iso = _now_iso()
                            try:
                                tweets_col.update_one(
                                    {"keyword": keyword, "text_sha1": _sha1(f"{keyword}|{text}")},
                                    {
                                        "$setOnInsert": {
                                            "keyword": keyword,
                                            "text": text,
                                            "text_sha1": _sha1(f"{keyword}|{text}"),
                                            "inserted_at": now_iso,
                                        },
                                        "$set": {
                                            "relevant": relevant_bool,
                                        },
                                    },
                                    upsert=True,
                                )
                            except PyMongoError as e:
                                print(f"[DB upsert] error for '{keyword}': {e}")

                    _touch_progress()
                    time.sleep(0.5)  
                except NoSuchElementException as e:
                    print(f"[scraper] no results for '{keyword}': {e}; continuing")
                    _touch_progress()
                    time.sleep(0.3)
                    continue
                except (NoSuchWindowException, TimeoutException) as e:
                    print(f"[scraper] window/timeout for '{keyword}': {e}; restarting driver")
                    _safe_close(wrapper)
                    wrapper = None
                    time.sleep(1 + random.uniform(0, 0.5))
                    break
                except WebDriverException as e:
                    print(f"[scraper] WebDriverException for '{keyword}': {e}; backoff {BACKOFF_SECONDS}s")
                    _safe_close(wrapper)
                    wrapper = None
                    time.sleep(BACKOFF_SECONDS + random.uniform(0, 0.5))
                    BACKOFF_SECONDS = min(MAX_BACKOFF_SECONDS, BACKOFF_SECONDS * 2)
                    break
                except Exception as e:
                    print(f"[scraper] loop error for '{keyword}': {e}; restarting driver")
                    _safe_close(wrapper)
                    wrapper = None
                    time.sleep(1 + random.uniform(0, 0.5))
                    break
            time.sleep(1)
    finally:
        _safe_close(wrapper)
        is_running = False
        print("Scraping stopped and driver closed.")

def process_scraped_results(raw_results):
    processed_results = {}
    
    for category, texts in raw_results.items():
        processed_results[category] = []
        
        for text in texts:
            if text and text.strip():  
                relevance_result = check_text_relevance(text)
                processed_results[category].append(relevance_result)
    
    return processed_results

def _fetch_top_from_db(keyword: str, limit: int):
    if not DB_ENABLED or (tweets_col is None):
        return []
    try:
        docs = list(
            tweets_col.find({"keyword": keyword}).sort([("inserted_at", -1)]).limit(limit)
        )
    except Exception as e:
        print(f"[DB find] error for '{keyword}': {e}")
        docs = []

    out = []
    for d in docs:
        text = d.get("text", "")
        relevant = d.get("relevant")
        if relevant is None and text:
            rr = check_text_relevance(text)
            relevant = bool(rr.get("relevant", False))
            try:
                tweets_col.update_one(
                    {"_id": d["_id"]},
                    {"$set": {"relevant": relevant}},
                )
            except PyMongoError as e:
                print(f"[DB update] error: {e}")
        out.append({
            "keyword": keyword,
            "text": text,
            "relevant": bool(relevant) if relevant is not None else False,
            "inserted_at": d.get("inserted_at"),
        })
    return out

def _load_default_keywords():
    try:
        with open(ROOT_DIR / "scraper" / "public" / "keywords.json", "r") as f:
            data = json.load(f)
            if isinstance(data, dict) and isinstance(data.get("keywords"), list):
                return [str(kw).strip() for kw in data["keywords"] if str(kw).strip()]
    except Exception as e:
        print(f"[keywords] failed to load default keywords: {e}")
    return []

def parse_keywords(req) -> list[str]:
    if req.is_json:
        data = req.get_json(silent=True) or {}
        kws = data.get("keywords")
        if isinstance(kws, list):
            return [str(k).strip() for k in kws if str(k).strip()]
    qs = req.args.get("keywords", "")
    if qs:
        return [k.strip() for k in qs.split(",") if k.strip()]
    return DEFAULT_KEYWORDS

def _sanitize_keywords(kws: list[str]) -> list[str]:
    seen, out = set(), []
    for k in kws:
        k2 = k.strip()
        if not k2 or len(k2) > 64:
            continue
        lk = k2.lower()
        if lk in seen:
            continue
        seen.add(lk)
        out.append(k2)
        if len(out) >= 50:  
            break
    return out

@app.route('/scrape', methods=['GET', 'POST'])
def scrape():
    print("Received scrape request")
    keywords_list = _sanitize_keywords(parse_keywords(request))
    print(f"Parsed keywords: {keywords_list}")
    if not keywords_list:
        return jsonify({
            'error': 'No keywords provided',
            'hint': 'Send JSON {"keywords": ["cyclone","flood"]} or use ?keywords=cyclone,flood'
        }), 400

    global is_running
    if is_running:
        return jsonify({'error': 'Scraping already running'}), 400

    try:
        start_scraping_thread(keywords_list)  
        return jsonify({'message': 'Scraping started', 'keywords': keywords_list}), 200
    except Exception as e:
        is_running = False
        return jsonify({'error': f'Failed to start scraping: {str(e)}'}), 500
    
@app.route('/restart', methods=['POST'])  
def restart():
    kws = _sanitize_keywords(parse_keywords(request))
    ok, msg = restart_scraper(kws if kws else None)
    status = 200 if ok else 400
    return jsonify({'message': msg, 'keywords': latest_keywords}), status

@app.route('/status',methods=['GET'])
def status():
    return jsonify({
        'is_running': is_running,
        'thread_alive': bool(scraping_thread and scraping_thread.is_alive()),
        'last_progress_age_sec': None if not last_progress_ts else round(time.time() - last_progress_ts, 1),
        'keywords': latest_keywords
    })

@app.route('/start', methods=['POST'])
def start_scraping():
    global scraping_thread, stop_event, is_running, results
    if is_running:
        return jsonify({'error': 'Scraping already running'}), 400

    keywords_list = _sanitize_keywords(parse_keywords(request))
    if not keywords_list:
        return jsonify({'error': 'No keywords provided'}), 400

    stop_event.clear()
    results = {}
    is_running = True
    scraping_thread = Thread(target=scraping_loop, args=(keywords_list,), daemon=True)
    scraping_thread.start()
    return jsonify({'message': 'Scraping started', 'keywords': keywords_list}), 200

@app.route('/results', methods=['GET'])
def get_results():
    keyword = request.args.get('keyword')
    keywords_csv = request.args.get('keywords')
    limit = int(request.args.get('limit', '10'))

    if keyword:
        data = _fetch_top_from_db(keyword, limit)
        return jsonify(data)

    if keywords_csv:
        groups = {}
        for kw in [k.strip() for k in keywords_csv.split(',') if k.strip()]:
            groups[kw] = _fetch_top_from_db(kw, limit)
        return jsonify(groups)

    raw_results = results.copy()
    processed_results = process_scraped_results(raw_results)
    return jsonify(processed_results)

@app.route('/results/raw', methods=['GET'])
def get_raw_results():
    return jsonify(results)

@app.route('/stop', methods=['POST'])
def stop_scraping():
    global is_running
    if not is_running:
        return jsonify({'error': 'Scraping is not running'}), 400
    stop_event.set()
    is_running = False
    return jsonify({'message': 'Scraping stopped'}), 200

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'is_running': is_running,'db_enabled':DB_ENABLED})

@app.route('/tweets/relevant', methods=['GET'])
def get_relevant_tweets():
    # Return a flat list of tweets with relevant=true, optional keywords filter
    if not DB_ENABLED or (tweets_col is None):
        return jsonify([])

    # keywords can be provided as CSV via ?keywords=kw1,kw2
    kws = _sanitize_keywords(parse_keywords(request))
    limit = request.args.get('limit', '20')
    try:
        limit_i = max(1, min(100, int(limit)))
    except Exception:
        limit_i = 20

    # Accept boolean True or common legacy forms ('true', 'True', 1)
    relevant_or = [
        { 'relevant': True },
        { 'relevant': { '$in': ['true', 'True', 1] } },
    ]
    and_clauses = [{ '$or': relevant_or }]

    if kws:
        # Case-insensitive exact match on keyword values
        ors = [{ 'keyword': { '$regex': f'^{re.escape(k)}$', '$options': 'i' } } for k in kws]
        and_clauses.append({ '$or': ors })

    query = and_clauses[0] if len(and_clauses) == 1 else { '$and': and_clauses }

    try:
        print(f"[/tweets/relevant] filters: keywords={kws}, limit={limit_i}")
        print(f"[/tweets/relevant] mongo query: {query}")
        docs = list(
            tweets_col.find(query, { 'keyword': 1, 'text': 1, 'relevant': 1, 'inserted_at': 1 })
            .sort([('inserted_at', -1)])
            .limit(limit_i)
        )
        print(f"[/tweets/relevant] matched: {len(docs)}")
    except Exception as e:
        print(f"[DB find relevant] error: {e}")
        docs = []

    out = []
    for d in docs:
        out.append({
            'keyword': d.get('keyword', ''),
            'text': d.get('text', ''),
            'relevant': bool(d.get('relevant', False)),
            'inserted_at': d.get('inserted_at'),
        })

    # Optional backfill: if nothing matched, allow recompute=1 to classify recent tweets and update DB
    if not out:
        recompute = (request.args.get('recompute') or '').lower() in ('1', 'true', 'yes')
        if recompute:
            try:
                backfill_query = {}
                if kws:
                    ors = [{ 'keyword': { '$regex': f'^{re.escape(k)}$', '$options': 'i' } } for k in kws]
                    backfill_query = { '$or': ors }
                print(f"[/tweets/relevant] backfill query: {backfill_query}")
                recent = list(
                    tweets_col.find(backfill_query, { 'keyword': 1, 'text': 1, 'inserted_at': 1 })
                    .sort([('inserted_at', -1)])
                    .limit(limit_i)
                )
                print(f"[/tweets/relevant] backfill candidates: {len(recent)}")
                out2 = []
                for d in recent:
                    text = d.get('text') or ''
                    kw = d.get('keyword') or ''
                    rr = check_text_relevance(text)
                    rel = bool(rr.get('relevant', False))
                    if rel:
                        out2.append({
                            'keyword': kw,
                            'text': text,
                            'relevant': True,
                            'inserted_at': d.get('inserted_at'),
                        })
                    try:
                        tweets_col.update_one(
                            { '_id': d.get('_id') },
                            { '$set': { 'relevant': rel, 'relevant_checked_at': _now_iso() } }
                        )
                    except Exception as ue:
                        print(f"[/tweets/relevant] backfill update error: {ue}")
                out = out2
            except Exception as be:
                print(f"[/tweets/relevant] backfill error: {be}")

    return jsonify(out)

if __name__ == '__main__':
    DEFAULT_KEYWORDS = _load_default_keywords()
    port = int(os.getenv("PORT", 5000))
    print(f"Starting Flask server on http://localhost:{port}")
    app.run(debug=True, host='0.0.0.0',port=port)
