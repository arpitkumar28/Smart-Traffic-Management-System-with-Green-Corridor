# Firebase Setup Guide

1. Create a Firebase project.
2. Enable Authentication with Email/Password.
3. Enable Firestore Database.
4. Enable Realtime Database.
5. Enable Cloud Functions.
6. Add a web app and copy config values into `frontend/.env.local`.
7. Add Android and iOS apps through FlutterFire:

```bash
dart pub global activate flutterfire_cli
flutterfire configure
```

8. Deploy rules and functions:

```bash
cd firebase
firebase deploy
```

Use one Firebase project for web, mobile, and functions.
