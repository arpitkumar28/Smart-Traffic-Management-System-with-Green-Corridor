# PROJECT_AUDIT — GreenFlow

Date: 2026-08-22

## Purpose
A concise inventory of the repository to guide the planned UI/UX redesign and phased implementation of GreenFlow production UI.

---

## High-level architecture

- Frontend: Next.js (app router), React, Tailwind, Leaflet (react-leaflet), Recharts, Framer Motion
- Backend: FastAPI (Python)
- Realtime: WebSocket endpoint at `/ws` implemented in FastAPI with a ConnectionManager
- Routing: OSRM (public router by default) via `backend/services/routing_service.py`
- Mobile: Flutter app (lib/services/api_service.dart exists)
- Database / Demo store: `backend/database/supabase.py` (demo_store used for mock/demo data)

---

## Backend — key files & routes

- `backend/main.py` — FastAPI app, includes routers and `/ws` WebSocket endpoint. Health at `/` returns `GreenFlow AI API online`.
- Routers included (see `backend/routes/`):
  - `dashboard` (GET `/dashboard` expected)
  - `signals` (prefix `/signals`)
  - `alerts` (prefix `/alerts`)
  - `analytics` (prefix `/analytics`)
  - `events` (prefix `/events`)
  - `prediction` (prefix `/prediction`)
  - `ambulance` (prefix `/ambulance`)

- `backend/routes/ambulance.py`:
  - `GET /ambulance` — returns `demo_store.ambulances + demo_store.fire_brigades`
  - `POST /ambulance/activate` — payload `{ ambulanceId, destination }` calls `activate_green_corridor`

- `backend/services/routing_service.py` — `get_road_route(origin, destination)` uses OSRM (env `MAP_ROUTING_URL`) and returns `route_coords`, `distance_m`, `duration_seconds`, `route_source`.

- `backend/services/websocket_service.py` — provides `ConnectionManager` and `manager.broadcast(event_type, payload)`.

---

## WebSocket events observed (frontend handlers)

- `SIGNAL_UPDATE` — payload contains `signals`
- `GREEN_CORRIDOR_ACTIVATED` — payload uses `GreenCorridorResponse` with `route_coords`, `signalsSynced`, etc.
- `EMERGENCY_VEHICLE_UPDATE` — triggers `fetchEmergencyVehicles()` in frontend
- `ANALYTICS_UPDATE`
- `event_update` / `event_updates`

Note: event naming is inconsistent (uppercase vs lowercase). Normalization should be part of the realtime service design.

---

## Frontend — key files & pages

- `frontend/app/command-center/page.tsx` — Command Center (overview) page. Uses `CommandCenterMap` component.
- `frontend/components/LiveMap.tsx` — map-centric live view with Leaflet, active route rendering, and WebSocket handlers.
- `frontend/app/emergency/page.tsx` — Emergency control page.
- `frontend/lib/api.ts` — typed API client, axios instance, WS helper `openGreenFlowSocket`, and TypeScript interfaces used across UI.
- Environment keys: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`

Other components to review later:
- `frontend/components/command-center/CommandCenterMap` (map abstraction used by command center)
- `frontend/components/ui` (Card, Button, etc.)
- `frontend/components/Shell.tsx` and layout components

---

## Flutter mobile

- `lib/services/api_service.dart` — appears to contain API integration for the mobile app. Flutter UI files under `lib/` exist and will need to be aligned to the new design tokens.

---

## Observations / current UI issues (candidate list for redesign)

- Brand strings and product text contain `AI` in visible UI and backend health (`GreenFlow AI`). Per product brief, visible text should be `GREENFLOW` and rename visible AI terminology to `Traffic Insights` / `Decision Engine` where appropriate.
- Colors and UI currently use glassmorphism and saturated accents inconsistent with the requested dark-navy technical aesthetic. Many components use `glass-card` styles; these must be replaced with a cohesive design token set.
- Some text and labels use hard-coded demo/fallback values on UI (e.g., emergency fallback in `CommandCenterPage.toggleEmergency`) — these are acceptable for demo but should be clearly labelled as `DEMO` / `SIMULATION` when not real.
- WebSocket event names are inconsistent; frontend handles both `SIGNAL_UPDATE` and `event_update` variants. Add a centralized normalizer.
- `backend/main.py` health string explicitly says `GreenFlow AI API online` (needs update to remove `AI` in visible strings). Record change but avoid breaking API behavior.
- Some components create UI-only simulated success states when API calls fail (e.g., `CommandCenterPage.toggleEmergency` catch handler creates a hardcoded corridor). These must remain but be clearly marked as `SIMULATION` when used.

---

## Immediate risks / constraints

- Backend secrets and service-role keys must not be added to frontend envs. Check `.env` usage and `NEXT_PUBLIC_*` variables.
- Do not replace or disable real API calls with mocks. Keep API wiring intact.
- OSRM endpoint is public by default; production deployments should set `MAP_ROUTING_URL`.

---

## Next recommended actions (phase 1→2 handoff)

1. Normalize visible product naming from `GREENFLOW AI` → `GREENFLOW` across frontend and public strings only.
2. Create shared design tokens (colors/typography/spacing) in `frontend/styles/tokens.ts` and Tailwind config.
3. Replace `glass-card` primitives with `Panel` / `Shell` components using the design tokens.
4. Centralize realtime event handling and normalize event types.
5. Inventory API endpoints and add TypeScript interfaces for any missing types.

---

## Files inspected so far

- [backend/main.py](backend/main.py)
- [backend/services/websocket_service.py](backend/services/websocket_service.py)
- [backend/routes/ambulance.py](backend/routes/ambulance.py)
- [backend/services/routing_service.py](backend/services/routing_service.py)
- [frontend/lib/api.ts](frontend/lib/api.ts)
- [frontend/components/LiveMap.tsx](frontend/components/LiveMap.tsx)
- [frontend/app/command-center/page.tsx](frontend/app/command-center/page.tsx)
- [frontend/app/emergency/page.tsx](frontend/app/emergency/page.tsx)

---

Prepared by: Senior Frontend Architect (automated audit)

*This file will be expanded as we continue the repository inventory and begin refactoring.*
