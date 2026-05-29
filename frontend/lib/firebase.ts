import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, onValue, push } from "firebase/database";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getDatabase(firebaseApp);
export const firestore = getFirestore(firebaseApp);

export async function triggerEmergencyCorridor() {
  const payload = {
    active: true,
    vehicleId: `EV-${Math.floor(200 + Math.random() * 700)}`,
    route: ["SIG-04", "SIG-01", "SIG-02", "SIG-05"],
    etaSeconds: 420,
    timeSavedSeconds: 210,
    updatedAt: Date.now(),
  };

  await set(ref(db, "greenCorridor/current"), payload);
  await push(ref(db, "alerts"), {
    type: "emergency",
    message: "Green Corridor AI activated",
    createdAt: Date.now(),
    payload,
  });
  await addDoc(collection(firestore, "emergencyEvents"), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

export function subscribeRealtime(path: string, callback: (value: unknown) => void) {
  return onValue(ref(db, path), (snapshot) => callback(snapshot.val()));
}
