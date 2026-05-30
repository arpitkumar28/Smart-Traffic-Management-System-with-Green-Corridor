# GreenFlow AI API

Base URL: `http://127.0.0.1:8000`

## REST Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/dashboard` | Hero dashboard metrics |
| `GET` | `/signals` | All traffic signals |
| `POST` | `/signals/{signal_id}/state?status=green` | Manual signal state update |
| `GET` | `/alerts` | Realtime alert list |
| `POST` | `/alerts` | Create traffic or emergency alert |
| `GET` | `/analytics` | Efficiency, response, CO2, and impact metrics |
| `GET` | `/events` | Live event feed |
| `GET` | `/prediction` | Rule-based AI congestion prediction |
| `POST` | `/ambulance/activate` | Activate Green Corridor AI |

## Ambulance Activation

Request:

```json
{
  "ambulanceId": "A-204",
  "destination": "City Hospital"
}
```

Response:

```json
{
  "status": "Green Corridor Activated",
  "etaBefore": 8,
  "etaAfter": 4,
  "timeSaved": 4
}
```

## WebSocket

Connect to `/ws`.

Broadcast event types:

- `signal_updates`
- `ambulance_updates`
- `alert_updates`
- `event_updates`
- `analytics_updates`

## Supabase Tables

```sql
create table signals (
  id text primary key,
  name text not null,
  status text not null,
  traffic_load integer not null
);

create table ambulances (
  id text primary key,
  vehicle_no text not null,
  destination text not null,
  eta integer not null,
  status text not null
);

create table alerts (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  created_at timestamptz default now()
);

create table analytics (
  id bigint generated always as identity primary key,
  efficiency integer not null,
  response_time integer not null,
  co2_reduction integer not null
);

create table events (
  id bigint generated always as identity primary key,
  message text not null,
  type text not null,
  created_at timestamptz default now()
);
```
