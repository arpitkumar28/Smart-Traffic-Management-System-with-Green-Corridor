# GreenFlow AI

GreenFlow AI is a full-stack smart traffic management demo for hackathons and smart-city pilots. It includes a futuristic web command dashboard, Flutter mobile app, Firebase realtime backend, Cloud Functions, and a Python AI engine scaffold for traffic density, emergency detection, and adaptive signal timing.

## Project Structure

```text
.
├── frontend/              # Next.js 15 dashboard
├── backend/functions/     # Firebase Cloud Functions
├── firebase/              # Firebase rules and config
├── ai-engine/             # Python OpenCV/YOLO-ready AI simulator
├── lib/                   # Flutter mobile app source
├── android/ ios/ web/     # Flutter platform targets
└── docs/                  # API and setup notes
```

## Web Dashboard

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Configure Firebase and Google Maps keys in `frontend/.env.local`.

## Flutter Mobile App

```bash
flutter pub get
flutter run
```

Build an Android APK:

```bash
flutter build apk --release
```

For Firebase, run `flutterfire configure` and add your generated platform config files. Use the same Firebase project as the web dashboard so realtime traffic, signal, and emergency data stays synchronized.

## Firebase Backend

```bash
cd backend/functions
npm install
npm run build
cd ../../firebase
firebase deploy
```

Deploy from the `firebase/` directory so rules, indexes, database rules, and functions source resolve together.

## AI Engine

```bash
cd ai-engine
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python greenflow_ai.py --watch
```

The simulator emits vehicle counts, density predictions, signal plans, and emergency corridor events. Replace the simulated detector with `ultralytics.YOLO` in `ai-engine/greenflow_ai.py` when camera feeds are available.

## Demo Flow

1. Launch the web dashboard and Flutter app.
2. Sign in or continue in demo mode on mobile.
3. Tap `Activate Ambulance Mode` in the mobile app or `Trigger Green Corridor` on the web dashboard.
4. Watch the route, alerts, signal status, ETA, and time-saved metrics update through the shared Firebase Realtime Database paths.

## Deployment

Vercel:

```bash
cd frontend
vercel
```

Set all `NEXT_PUBLIC_FIREBASE_*` and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` environment variables in Vercel before production deployment.
