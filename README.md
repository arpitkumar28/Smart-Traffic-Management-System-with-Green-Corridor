# GreenFlow AI

GreenFlow AI is a production-style hackathon MVP for AI-powered smart traffic management and emergency response. It uses a Flutter mobile app, Next.js command center, FastAPI backend, Supabase PostgreSQL, WebSockets, OpenStreetMap, and a rule-based AI decision engine to create Green Corridors for ambulances.

## Problem

Ambulances lose critical minutes at congested intersections. Static traffic signals cannot react fast enough to emergency vehicles, road conditions, or sudden congestion.

## Solution

GreenFlow AI detects congestion, predicts risk, synchronizes traffic signals, and activates green corridors that cut ambulance ETA from 8 minutes to 4 minutes in demo mode.

## Features

- Green Corridor activation through Flutter and web dashboard
- FastAPI REST endpoints for dashboard, signals, alerts, events, analytics, and AI prediction
- WebSocket `/ws` broadcasts for realtime signal, ambulance, alert, event, and analytics updates
- Supabase-ready database layer with demo fallback data
- OpenStreetMap maps in Flutter and Next.js
- Wire intelligence card with traffic, emergency, weather, road, and public alert sources
- Demo mode with realistic traffic, congestion, alerts, and ambulance movement

## Architecture

```text
Flutter App / Next.js Dashboard
        ↓
FastAPI Backend + WebSocket
        ↓
Supabase PostgreSQL
        ↓
AI Decision Engine
        ↓
Green Corridor Controller
```

See `docs/ARCHITECTURE.md` for the Mermaid diagram.

## Tech Stack

- Mobile: Flutter, Material 3, Provider, fl_chart, flutter_map, http, web_socket_channel
- Web: Next.js 15, TypeScript, TailwindCSS, Recharts, Leaflet/OpenStreetMap, Axios
- Backend: FastAPI, Pydantic, Supabase Python client, WebSockets
- Hosting: Render for backend, Vercel for web, Supabase for database

## Run Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Run Flutter

```bash
flutter pub get
flutter run
```

## Run Web Dashboard

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Supabase Setup

Create the tables in `docs/API.md`, then set:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Without credentials, the backend runs with seeded demo data.

## Green Corridor AI

`POST /ambulance/activate` updates ambulance status, turns route signals green, creates event logs, updates analytics, reduces ETA, and broadcasts realtime updates through `/ws`.

## Demo Flow

Login, view dashboard metrics, inspect AI prediction, open map visualization, activate ambulance mode, watch Green Corridor activation, verify signal synchronization, then show analytics improvements.

## Deployment

- Backend: deploy `backend/` to Render with `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Web: deploy `frontend/` to Vercel with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`
- Database: host PostgreSQL tables in Supabase

## Future Scope

Computer vision camera feeds, real ambulance GPS, city-wide signal controller integrations, historical ML forecasting, and verified Wire data ingestion.

## Impact

The demo highlights emergency vehicles assisted, hours saved, CO2 reduced, and traffic jams prevented.
