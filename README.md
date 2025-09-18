# Track My Impact

A full‑stack web app for AI waste classification and environmental impact tracking. It combines a Next.js frontend with a FastAPI backend, using EPA WARM v15.2 factors to compute CO₂, energy, and water savings for different waste management methods (recycle, compost, landfill).

Key features
- AI classification: On‑device TensorFlow.js model (MobileNetV2) predicts the waste class from a photo.
- Real WARM data: Accurate, material‑specific impact factors (v15.2) used across the app.
- Dynamic logger: Material list and management methods are derived from the dataset; options update per selection.
- Server‑backed flows: Logger, Calculator, and AI classification call the backend API (fallback to local JSON if offline).
- Progress & logs: Recent items and cumulative totals; backend recent activity when available, else local fallback.
- Simple deployment: Render (API) + Vercel (UI) with auto‑deploys on push.


## Tech Stack
- Frontend: Next.js 15, React 18, Tailwind, Radix UI, TFJS
- Backend: FastAPI, SQLAlchemy 2 (async), Pydantic v2, SQLite (aiosqlite)
- Auth: JWT (access + refresh), Passlib (bcrypt)
- Infra: Render (web service + persistent disk) and Vercel (static hosting)


## Repository Structure
- `backend/` — FastAPI app
  - `app/main.py` — app entry (startup/shutdown events)
  - `app/routers/*` — feature routers (`auth`, `impact`, `waste`, `community`, `users`)
  - `app/models/` — SQLAlchemy models + Pydantic schemas
  - `app/core/` — config, database (async engine), auth utils
  - `app/utils/impact_calculator.py` — calculator helpers
  - `requirements.txt` — backend deps
  - `init_database.py` — creates tables, seeds a test user and (optionally) dataset
- `track-my-impact/` — Next.js app
  - `src/components/*` — UI (Logger, Calculator, AI Classification, etc.)
  - `src/lib/api.ts` — minimal API client (login, materials, calculate, summary, recent)
  - `src/hooks/useTrackMyImpactData.tsx` — loads local JSON data for client fallback
  - `public/data/*.json` — WARM factors, domestic materials, equivalencies, country context
  - `public/model/` — place TFJS model (`model.json` + shards) for real AI inference
- `render.yaml` — Render blueprint (backend service + seed cron job)
- `DEPLOYMENT.md` — quick deploy guide
- `scripts/clean_repo.sh` — cleans artifacts (incl. macOS `._*` files, Next.js `out/`, `.next/`)
- `docs/` — developer docs and reference assets (moved from `uploads/`)

## Data Sources
- Frontend JSON (served by Next.js):
  - `track-my-impact/public/data/warm-factors.json`
  - `track-my-impact/public/data/domestic-materials.json`
  - `track-my-impact/public/data/equivalency-factors.json`
  - `track-my-impact/public/data/country-context.json`
  - `track-my-impact/public/data/petco-locations.json`
- Frontend loader:
  - `track-my-impact/src/hooks/useTrackMyImpactData.tsx` fetches the above files and exposes them to components.
- Backend seeding linkage:
  - `backend/init_database.py` reads the same JSON files from `track-my-impact/public/data/` and seeds the `domestic_materials` and `warm_factors` tables. Disposal methods are normalized to `recycled | composted | landfilled` during seeding.
- AI model files:
  - TFJS model at `track-my-impact/public/model/model.json` (+ shard `.bin` files)
  - Labels at `track-my-impact/public/labels.json` (array or index mapping; the loader normalizes into ordered labels)

These sources are the single truth for both client‑side fallback and backend‑backed features, keeping calculations consistent across UI and API.


## Data Sources
- `track-my-impact/public/data/warm-factors.json`
- `track-my-impact/public/data/domestic-materials.json`
- `track-my-impact/public/data/equivalency-factors.json`
- `track-my-impact/public/data/country-context.json`
- `track-my-impact/public/data/petco-locations.json`

The frontend loads these via `useTrackMyImpactData`. The backend can seed the DB from the same JSON to serve API‑based calculations.


## Local Development
Prereqs: Node 18+, Python 3.11+, Git.

Backend (FastAPI)
1) Create venv and install deps
```
cd backend
python -m venv venv
source venv/bin/activate
pip install -U pip setuptools wheel
pip install -r requirements.txt
```
2) Initialize the database (creates tables, seeds test user; optionally seeds datasets)
```
python init_database.py
```
3) Run the API (macOS‑friendly loop/http)
```
uvicorn app.main:app --host 0.0.0.0 --port 8000 --loop asyncio --http h11
```
4) Health check
```
curl http://127.0.0.1:8000/health
```

Frontend (Next.js)
1) Install and run
```
cd track-my-impact
npm install
# Optional if your backend is remote; default is http://127.0.0.1:8000
export NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
npm run dev
```
2) Open the app: `http://localhost:3000`


## Authentication (dev)
- Seeded test user: `username: test`, `password: test123`
- Login: `POST /api/auth/login` returns `access_token`; use `Authorization: Bearer <token>` for protected endpoints.


## Core API Endpoints
- `GET /health` — service health
- `POST /api/auth/login` — login and get tokens
- `GET /api/waste/materials` — list of classifiable materials
- `POST /api/impact/calculate` — authoritative calculation + record insert
- `GET /api/impact/summary?period=weekly|monthly|all_time` — user totals
- `GET /api/impact/recent?limit=10` — recent user activities

Example (login & calculate):
```
# Login
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"test","password":"test123"}' | jq -r .access_token)

# Calculate impact for a material_id
curl -s -X POST http://127.0.0.1:8000/api/impact/calculate \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"material_id":"<ID>","weight_grams":500,"disposal_method":"recycled"}'
```


## AI Classifier (TFJS)
- Put your TFJS model under `track-my-impact/public/model/model.json` (with shard files) and labels at `track-my-impact/public/labels.json`.
- Convert Keras to TFJS:
```
pip install tensorflowjs
tensorflowjs_converter --input_format=keras waste_model.keras track-my-impact/public/model
```
- The loader is in `track-my-impact/src/utils/model-loader.ts`. The UI uses `AIClassificationReal.tsx`.
- If the model is missing, the app uses a safe mock mode for demos.


## Deployment (Simple & Repeatable)
Recommended: Render (backend) + Vercel (frontend).

Backend on Render (Blueprint)
- Ensure `render.yaml` is at the repo root (it provisions the web service + a cron seed job).
- Create from Blueprint → select your repo/branch → Create Resources.
- After deploy: open service → Shell → `cd backend && python init_database.py`.
- Health: visit `https://<your-backend-domain>/health`.
- CORS: set `ALLOWED_ORIGINS` to include your frontend domain (Vercel URL or custom domain).

Frontend on Vercel
- Import the repo; set Root Directory to `track-my-impact`.
- Add env var `NEXT_PUBLIC_API_BASE_URL=https://<your-backend-domain>`.
- Deploy; share the Vercel URL with testers.

Optional: Single‑Origin Proxy
- To serve API under the same frontend URL, add a Vercel rewrite to proxy `/api/*` to the backend. Example `vercel.json` (in frontend root or monorepo root configured for Vercel):
```
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://<your-backend-domain>/api/$1" }
  ]
}
```
- Then set `NEXT_PUBLIC_API_BASE_URL` to empty (or use relative `/api`).


## Troubleshooting
- Port 8000 in use:
  - `lsof -ti tcp:8000 | xargs kill -9`
- macOS “bus error” (uvloop/httptools):
  - Run Uvicorn with `--loop asyncio --http h11` (as shown), or `pip uninstall -y uvloop httptools` in the backend venv.
- TypeError: '_GeneratorContextManager' in startup:
  - Fixed by using FastAPI startup/shutdown events and an async engine.
- ESM module errors in Next:
  - Ensure `track-my-impact/package.json` has `"type": "module"` and `next.config.js` uses `export default`.
- AppleDouble files (macOS `._*`) showing in diffs:
  - They’re ignored via `.gitignore`. Clean them with `scripts/clean_repo.sh`.
- Backend 401s:
  - Ensure `Authorization: Bearer <access_token>` header is set after logging in.
- CORS errors in production:
  - Add your frontend domain to `ALLOWED_ORIGINS` on Render, redeploy the backend.


## Contributing
- Keep changes small and focused; run the frontend and backend locally before pushing.
- For dataset updates (`public/data/*.json`), consider seeding the backend so server calculations match the UI.
- Feel free to open issues/PRs for bugs, enhancements, or deployment tweaks.
