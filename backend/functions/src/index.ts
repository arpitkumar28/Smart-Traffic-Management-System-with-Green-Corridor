import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

admin.initializeApp();

const rtdb = admin.database();
const firestore = admin.firestore();

type Signal = {
  id: string;
  congestion: number;
  status: "green" | "yellow" | "red" | "priority";
};

const demoSignals: Signal[] = [
  { id: "SIG-01", congestion: 38, status: "priority" },
  { id: "SIG-02", congestion: 54, status: "green" },
  { id: "SIG-03", congestion: 88, status: "red" },
  { id: "SIG-04", congestion: 26, status: "priority" },
];

export const activateGreenCorridor = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login is required.");
  }

  const vehicleId = String(request.data?.vehicleId ?? `EV-${Date.now().toString().slice(-4)}`);
  const route = Array.isArray(request.data?.route) ? request.data.route : ["SIG-04", "SIG-01", "SIG-02", "SIG-05"];
  const event = {
    active: true,
    vehicleId,
    route,
    etaSeconds: 420,
    timeSavedSeconds: 210,
    status: "active",
    createdAt: Date.now(),
  };

  await Promise.all([
    rtdb.ref("greenCorridor/current").set(event),
    rtdb.ref("signals").set(
      demoSignals.map((signal) => ({
        ...signal,
        status: route.includes(signal.id) ? "priority" : signal.status,
      })),
    ),
    rtdb.ref("alerts").push({
      type: "emergency",
      message: `Green Corridor AI activated for ${vehicleId}`,
      createdAt: Date.now(),
    }),
    firestore.collection("emergencyEvents").add({
      ...event,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }),
  ]);

  return event;
});

export const simulateTrafficTick = onSchedule("every 1 minutes", async () => {
  const signals = demoSignals.map((signal) => ({
    ...signal,
    congestion: Math.max(12, Math.min(98, signal.congestion + Math.round(Math.random() * 18 - 9))),
    updatedAt: Date.now(),
  }));

  await Promise.all([
    rtdb.ref("signals").set(signals),
    rtdb.ref("traffic/live").set({
      networkFlow: Math.round(70 + Math.random() * 22),
      vehiclesPerMinute: Math.round(900 + Math.random() * 520),
      avgWaitSeconds: Math.round(35 + Math.random() * 25),
      updatedAt: Date.now(),
    }),
  ]);
});
