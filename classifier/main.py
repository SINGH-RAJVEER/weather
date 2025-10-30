from sentence_transformers import SentenceTransformer, util
import pandas as pd
import re
from pathlib import Path
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = str((BASE_DIR / 'fine-tuned-model').resolve())
CSV_PATH = str((BASE_DIR / 'disaster_dataset.csv').resolve())

model = SentenceTransformer(MODEL_PATH)

df = pd.read_csv(CSV_PATH)
labels = df['label'].unique()
label_map = {idx: label for idx, label in enumerate(labels)}

label_keywords = {
    'tsunami': 'tsunami, tidal wave, sea wave, giant wave, water surge',
    'cyclone': 'cyclone, hurricane, typhoon, storm, tropical storm, severe storm, depression',
    'flooding': 'flood, flash flood, river overflow, waterlogging, inundated, submerged, heavy flooding',
    'storm_surge': 'storm surge, sea surge, seawater intrusion, coastal flooding, waves crashing',
    'earthquake': 'earthquake, tremor, seismic activity, aftershock, quake, magnitude',
    'landslide': 'landslide, mudslide, hill collapse, slope failure, debris flow, rockslide',
    'erosion': 'coastal erosion, beach erosion, shore erosion, sand loss',
    'heavy_rain': 'heavy rain, rainfall, downpour, monsoon rain, cloudburst, torrential rain',
    'wind': 'strong winds, high winds, gusts, gale, windstorm, stormy winds',
    'low_pressure': 'low pressure, depression formed, cyclonic circulation, pressure drop',
    'ocean_conditions': 'rough sea, high tide, tidal surge, rip current, ocean swell, big waves',
    'casualties': 'dead, deaths, fatalities, injured, wounded, casualties, missing, disappeared',
    'trapped_people': 'trapped, stranded, stuck, cut off, isolated, cannot escape',
    'property_damage': 'destroyed house, collapsed building, broken infrastructure, damaged road, washed away',
    'infrastructure': 'power cut, blackout, communication down, network outage, bridge collapse, transport disrupted',
    'livelihood': 'fishermen stranded, boats damaged, crops destroyed, lost nets, destroyed fields',
    'alerts': 'alert, warning, siren, red alert, yellow alert, advisory, issued notice',
    'evacuation': 'evacuation, evacuate, moved to shelter, taken to safety, relocation',
    'rescue': 'rescue, saved, rescued, NDRF, SDRF, coast guard, navy rescue, emergency services',
    'relief_camps': 'relief camp, shelter, safe place, distribution point, food camp, water supply',
    'aid': 'relief supplies, aid distribution, food packets, drinking water, clothes, medical help, donation, volunteers',
    'distress_signals': 'help, SOS, need food, need water, need medicine, please rescue, urgent help',
    'damage_reports': 'flooded street, road blocked, house collapsed, wall fell, water entered home',
    'social_sentiment': 'prayers, stay safe, tragic, disaster struck, heartbreaking, solidarity',
    'authorities': 'government alert, official update, disaster management, INCOIS, IMD, meteorological department, coast guard',
    'coordination': 'emergency response, command center, disaster relief, coordination team',
    'media_reports': 'breaking news, urgent news, news alert, media coverage, live report',
    'coastal_terms': 'coast, beach, shore, seaside, bay, port, harbor, jetty, island, delta',
    'community_terms': 'village, fishermen, coastal town, hamlet, community center, colony',
    'epidemics': 'disease outbreak, cholera, dengue, malaria, fever spreading after flood',
    'contamination': 'contaminated water, dirty water, unsafe drinking water, sewage, pollution',
    'food_shortage': 'food shortage, no supplies, ration finished, hunger, starving',
    'economic_loss': 'property loss, crop loss, livelihood loss, financial damage, destroyed market'
}

label_centroids = {}
for idx, label in enumerate(labels):
    texts = df[df['label'] == label]['text'].tolist()
    if texts:
        embeddings = model.encode(texts)
        centroid = embeddings.mean(axis=0)
        label_centroids[idx] = centroid

try:
    self_sims = []
    for idx, label in enumerate(labels):
        texts = df[df['label'] == label]['text'].tolist()
        if not texts:
            continue
        embs = model.encode(texts)
        centroid = label_centroids.get(idx)
        if centroid is None:
            continue
        sims = util.cos_sim(embs, centroid).cpu().numpy().reshape(-1)
        self_sims.extend(sims.tolist())
    if self_sims:
        GLOBAL_SIM_CUTOFF = float(np.quantile(self_sims, 0.25))
        GLOBAL_SIM_CUTOFF = max(GLOBAL_SIM_CUTOFF, 0.15)
    else:
        GLOBAL_SIM_CUTOFF = 0.3
except Exception:
    GLOBAL_SIM_CUTOFF = 0.3


def classify(text):
    embedding = model.encode([text])[0]
    similarities = {idx: util.cos_sim(embedding, centroid).item() for idx, centroid in label_centroids.items()}
    best_idx = max(similarities, key=similarities.get)
    return {
        'text': text,
        'predicted_label': label_map[best_idx],
        'similarity_scores': {label_map[idx]: score for idx, score in similarities.items()}
    }


def most_relevant_keywords(text, top_n=10):
    text_emb = model.encode(text)
    scored_keywords = []
    for label, keywords_str in label_keywords.items():
        keywords = [kw.strip() for kw in keywords_str.split(',')]
        for kw in keywords:
            kw_emb = model.encode(kw)
            score = util.cos_sim(text_emb, kw_emb).item()
            scored_keywords.append({
                'keyword': kw,
                'label': label,
                'score': score
            })
    scored_keywords.sort(key=lambda x: x['score'], reverse=True)
    return scored_keywords[:top_n]


def matched_keywords(text):
    text_lower = text.lower()
    text_clean = re.sub(r'[^\w\s]', ' ', text_lower)
    matched = []
    for label, keywords_str in label_keywords.items():
        keywords = [kw.strip().lower() for kw in keywords_str.split(',')]
        for kw in keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_clean) or kw in text_clean:
                kw_emb = model.encode(kw)
                text_emb = model.encode(text)
                score = util.cos_sim(text_emb, kw_emb).item()
                matched.append({
                    'keyword': kw,
                    'label': label,
                    'score': score
                })
    matched.sort(key=lambda x: x['score'], reverse=True)
    return matched


def is_related(text):
    embedding = model.encode([text])[0]
    similarities = [util.cos_sim(embedding, centroid).item() for centroid in label_centroids.values()]

    max_similarity = max(similarities) if similarities else 0

    matched = matched_keywords(text)

    if max_similarity >= GLOBAL_SIM_CUTOFF:
        return True

    elif max_similarity >= GLOBAL_SIM_CUTOFF * 0.7 and matched:
        contextual_scores = [item['score'] for item in matched]

        avg_context_score = sum(contextual_scores) / len(contextual_scores) if contextual_scores else 0

        return avg_context_score > 0.5

    return False
