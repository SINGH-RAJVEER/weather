# Copilot Instructions for Weather

This guide enables AI coding agents to be productive in the Weather codebase. It summarizes architecture, workflows, and conventions unique to this project.

## Architecture Overview

- **Monorepo** with four main services:
  - `frontend/`: React + Vite web client (TypeScript, Tailwind)
  - `backend/`: Node.js (TypeScript, Bun) REST API, MongoDB models, routes, and utilities
  - `classifier/`: Python Flask API for disaster text classification, includes a fine-tuned SentenceTransformer model
  - `scraper/`: Python service for scraping and processing disaster-related tweets/news
- **Data Flow:**
  - Scraper collects data → Classifier API determines relevance/type → Backend stores and exposes data → Frontend displays reports and advisories

## Developer Workflows

- **Frontend:**
  - Use Bun or npm for install/start: `bun install && bun run dev` or `npm install && npm run dev`
  - Main entry: `src/App.tsx`, API calls in `src/api/`, context in `src/contexts/`
- **Backend:**
  - Bun or npm for install/start: `bun install && bun start` or `npm install && npm start`
  - MongoDB required; models in `app/models/`, routes in `app/routes/`
- **Classifier:**
  - Use `uv` for Python env: `uv venv && uv pip install -r requirements.txt`
  - Start API: `uv run python api.py`
  - Endpoints: `/api/is_relevant`, `/api/classify`, `/health`
- **Scraper:**
  - Use `uv` for Python env: `uv venv && uv pip install -r requirements.txt`
  - Start: `uv run python app.py`
  - Endpoints: `/scrape`, `/restart`, `/status`, `/results`, `/results/raw`, `/stop`, `/health`, `/tweets/relevant`

## Project-Specific Conventions

- **Commit Messages:** Tag with "vibe coded" if code is experimental or non-standard
- **Forking:** Fork and PR frequently for collaborative work
- **API Patterns:**
  - Classifier and Scraper APIs use JSON POST bodies and health endpoints
  - Scraper keywords managed via `public/keywords.json`
- **TypeScript:**
  - Backend and frontend use strict typing; shared types in `frontend/src/types/`
- **Data Models:**
  - MongoDB schemas in `backend/app/models/`
- **External Dependencies:**
  - Classifier uses SentenceTransformer (see `classifier/fine-tuned-model/README.md`)
  - Scraper integrates with Twitter/news sources

## Integration Points

- **Frontend <-> Backend:** REST API calls via `src/api/`
- **Backend <-> Classifier/Scraper:** Communicates via HTTP endpoints
- **Classifier Model:** Details and usage in `classifier/fine-tuned-model/README.md`

## Examples

- To classify a tweet: POST to `/classifier/api/classify` with `{ "text": "..." }`
- To scrape new keywords: POST to `/scraper/scrape` with `{ "keywords": ["flood", "cyclone"] }`
- To add a new hazard report: Update `backend/app/routes/hazardReports.ts` and corresponding model

## Key Files & Directories

- `frontend/src/api/` – API integration
- `backend/app/models/` – Data schemas
- `classifier/api.py` – Classifier API logic
- `scraper/app.py` – Scraper API logic
- `classifier/fine-tuned-model/README.md` – Model details

---

For unclear or missing conventions, ask for clarification or check the relevant README in each service directory.
