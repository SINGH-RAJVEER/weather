# Weather Reporting Engine

## Rules

- Mention in the commit message if any part being pushed is "vibe coded" for better backtracking when needed.
- Fork the repo before starting work of the project and create a pull request frequently.

## To run the application

### Frontend

1. Open a terminal and navigate to the `frontend` directory:
   ```sh
   cd frontend
   ```
2. Install dependencies (choose one):
   - Using npm:
     ```sh
     npm install
     ```
   - Using bun:
     ```sh
     bun install
     ```
3. Start the development server (choose one):
   - Using npm:
     ```sh
     npm run dev
     ```
   - Using bun:
     ```sh
     bun run dev
     ```

---

### Backend

1. Make sure your MongoDB server is running.
2. Open a new terminal and navigate to the `backend` directory:
   ```sh
   cd backend
   ```
3. Install dependencies (choose one):
   - Using npm:
     ```sh
     npm install
     ```
   - Using bun:
     ```sh
     bun install
     ```
4. Start the backend server (choose one):
   - Using npm:
     ```sh
     npm start
     ```
   - Using bun:
     ```sh
     bun start
     ```

---

### Classifier

1. Open a new terminal and navigate to the `classifier` directory:
   ```sh
   cd classifier
   ```
2. Create a virtual environment using `uv`:
   ```sh
   uv venv
   ```
3. Install the dependencies using `uv`:
   ```sh
   uv pip install -r requirements.txt
   ```
4. Start the classifier server using `uv`:
   ```sh
   uv run python api.py
   ```

---

### Scraper

1. Open a new terminal and navigate to the `scraper` directory:
   ```sh
   cd scraper
   ```
2. Create a virtual environment using `uv`:
   ```sh
   uv venv
   ```
3. Install the dependencies using `uv`:
   ```sh
   uv pip install -r requirements.txt
   ```
4. Start the scraper server using `uv`:
   ```sh
   uv run python app.py
   ```

---
