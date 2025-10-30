from flask import Flask, request, jsonify
from main import (
    classify as ex_classify,
    is_related as ex_is_related,
    most_relevant_keywords,
    matched_keywords,
)

app = Flask(__name__)


def _get_payload():
    data = request.get_json(silent=True) or {}
    text = data.get('text')
    if not text:
        return None, jsonify({'error': 'Missing "text" in JSON body'}), 400
    top_n = data.get('top_n', 10)
    try:
        top_n = int(top_n)
    except Exception:
        top_n = 10
    return (text, top_n), None, None


@app.post('/api/is_relevant')
def is_relevant():
    payload, err, status = _get_payload()
    if err:
        return err, status
    text, _ = payload
    relevant = ex_is_related(text)
    return jsonify({'relevant': bool(relevant)}), 200


@app.post('/api/classify')
def classify():
    payload, err, status = _get_payload()
    if err:
        return err, status
    text, top_n = payload

    cls = ex_classify(text)
    matched = matched_keywords(text)
    top_kw = most_relevant_keywords(text, top_n=top_n)
    relevant = ex_is_related(text)

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
    return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
