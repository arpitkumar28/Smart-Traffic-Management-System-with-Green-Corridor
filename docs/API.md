# GreenFlow AI API

## Realtime Database Paths

| Path | Purpose |
| --- | --- |
| `traffic/live` | Live network flow, vehicles per minute, and wait time |
| `signals` | Signal status, congestion load, and emergency priority mode |
| `greenCorridor/current` | Active emergency vehicle, route, ETA, and time saved |
| `alerts` | Realtime operational alerts for web and mobile clients |

## Callable Functions

### `activateGreenCorridor`

Activates an emergency corridor and writes synchronized signal updates.

Request:

```json
{
  "vehicleId": "EV-204",
  "route": ["SIG-04", "SIG-01", "SIG-02", "SIG-05"]
}
```

Response:

```json
{
  "active": true,
  "vehicleId": "EV-204",
  "route": ["SIG-04", "SIG-01", "SIG-02", "SIG-05"],
  "etaSeconds": 420,
  "timeSavedSeconds": 210,
  "status": "active"
}
```

## Firestore Collections

| Collection | Purpose |
| --- | --- |
| `users` | User profiles and role metadata |
| `emergencyEvents` | Historical green corridor activations |
| `trafficReports` | Daily congestion, signal, and eco-mode summaries |

## Roles

Suggested Firebase custom claims:

| Role | Permissions |
| --- | --- |
| `admin` | Full dashboard and signal control |
| `operator` | Activate corridor and manage alerts |
| `driver` | Mobile emergency interface |
| `citizen` | Read traffic alerts and congestion status |
