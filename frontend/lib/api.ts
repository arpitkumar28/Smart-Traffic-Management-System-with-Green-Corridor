import axios, { AxiosError } from "axios";

export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://smart-traffic-management-system-with.onrender.com";
export const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "wss://smart-traffic-management-system-with.onrender.com/ws";

export const api = axios.create({ baseURL: apiUrl, timeout: 10000 });

export type SignalStatus = "green" | "yellow" | "red" | "priority" | "green_corridor" | string;

export interface DashboardMetrics {
  trafficFlow: number;
  vehiclesPerMinute: number;
  avgWait: number;
  activeSignals: number;
  emergencyVehiclesActive: number;
  aiPredictionConfidence?: number;
}

export interface Signal {
  id: string;
  name: string;
  status: SignalStatus;
  traffic_load: number;
  lat: number;
  lng: number;
}

export interface IoTNode {
  nodeId: string;
  intersectionId: string;
  name: string;
  status: "ONLINE" | "OFFLINE" | "WARNING" | "STALE";
  mode: "SIMULATION" | "LIVE";
  vehicleCount: number;
  queueLengthMeters: number;
  signalState: string;
  signalPhase: string;
  phaseRemainingSeconds: number;
  connectivity: string;
  latitude: number;
  longitude: number;
  lastUpdated: string;
  sensorStatus: string;
  signalControllerStatus: string;
  coordinationStatus?: string;
}

export interface IoTNetworkResponse {
  mode: "SIMULATION" | "LIVE";
  scenario: string;
  nodes: IoTNode[];
}

export interface EmergencyVehicle {
  id: string;
  type: "ambulance" | "fire_brigade" | string;
  lat: number;
  lng: number;
  destination?: string;
  status?: string;
}

export interface Alert {
  id: number;
  title: string;
  description?: string;
  severity?: string;
  created_at?: string;
}

export interface TrafficEvent {
  id: number | string;
  event?: string;
  message?: string;
  timestamp?: string;
  created_at?: string;
  type?: string;
  location?: string;
}

export interface AnalyticsData {
  metric: string;
  value: number;
  timestamp?: string;
}

export interface GreenCorridorResponse {
  status?: string;
  type?: string;
  ambulance?: string;
  vehicleId?: string;
  destination?: string;
  etaBefore?: number;
  etaAfter?: number;
  timeSaved?: number;
  signalsOptimized?: number;
  signalsSynced?: number;
  route?: string[];
  route_coords?: [number, number][];
  priorityScore?: number;
}

export interface EmergencyCorridorDemo {
  scenario: "EMERGENCY_CORRIDOR_DEMO";
  mode: "SIMULATION";
  vehicle: "SIM-EMERGENCY-01";
  vehicleType: string;
  destination: "Simulation Hospital";
  route: string[];
  affectedNodes: number;
  status: "IDLE" | "PREPARED" | "EXECUTING" | "CONFIRMED";
  nodes: IoTNode[];
  timestamp: string;
}

export interface AIRecommendation {
  zone: string;
  risk: string;
  confidence: number;
  currentTraffic?: string;
  predictedTraffic?: string;
  recommendedAction: string;
}

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
}

export type NormalizedEventType =
  | "signal.update"
  | "corridor.activated"
  | "corridor.completed"
  | "vehicle.update"
  | "analytics.update"
  | "event.created"
  | "alert.update"
  | "iot.node.update"
  | "unknown"
  | string;

export function normalizeWebSocketEventType(raw: string | undefined): NormalizedEventType {
  const input = (raw ?? "").trim();
  if (!input) return "unknown";

  const normalized = input.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  if (normalized.includes("signal")) return "signal.update";
  if (normalized.includes("green_corridor_prepared")) return "corridor.prepared";
  if (normalized.includes("green_corridor_confirmed")) return "corridor.confirmed";
  if (normalized.includes("green_corridor_activated") || normalized === "corridor_activated") return "corridor.activated";
  if (normalized.includes("corridor_completed") || normalized.includes("corridor_terminated")) return "corridor.completed";
  if (normalized.includes("alert")) return "alert.update";
  if (normalized.includes("analytics")) return "analytics.update";
  if (normalized.includes("vehicle") || normalized.includes("ambulance")) return "vehicle.update";
  if (normalized.includes("iot") || normalized.includes("node_update")) return "iot.node.update";
  if (normalized.includes("event")) return "event.created";

  return normalized as NormalizedEventType;
}

class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public originalError?: AxiosError
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function handleApiError(error: unknown): APIError {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status ?? 500;
    const message =
      (typeof error.response?.data === "object" && error.response?.data !== null && "detail" in error.response.data
        ? String((error.response.data as { detail?: string }).detail ?? error.message)
        : error.message) || "An error occurred while fetching data";
    return new APIError(statusCode, message, error);
  }
  return new APIError(500, error instanceof Error ? error.message : String(error));
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const { data } = await api.get<DashboardMetrics>("/dashboard");
  return data;
}

export async function fetchSignals(): Promise<Signal[]> {
  const { data } = await api.get<Signal[]>("/signals");
  return data;
}

export async function fetchIoTNetwork(): Promise<IoTNetworkResponse> {
  const { data } = await api.get<IoTNetworkResponse>("/edge-network");
  return data;
}

export async function setIoTScenario(scenario: string): Promise<IoTNetworkResponse> {
  const { data } = await api.post<IoTNetworkResponse>("/edge-network/simulation/scenario", { scenario });
  return data;
}

export async function resetIoTSimulation(): Promise<IoTNetworkResponse> {
  const { data } = await api.post<IoTNetworkResponse>("/edge-network/simulation/reset");
  return data;
}

export async function prepareEmergencyDemo(): Promise<EmergencyCorridorDemo> {
  const { data } = await api.post<EmergencyCorridorDemo>("/edge-network/simulation/demo/emergency");
  return data;
}

export async function executeEmergencyDemo(failure?: "HTTP" | "TIMEOUT"): Promise<EmergencyCorridorDemo> {
  const { data } = await api.post<EmergencyCorridorDemo>("/edge-network/simulation/demo/emergency/execute", failure ? { failure } : {});
  return data;
}

export async function resetEmergencyDemo(): Promise<EmergencyCorridorDemo> {
  const { data } = await api.post<EmergencyCorridorDemo>("/edge-network/simulation/demo/reset");
  return data;
}

export async function updateSignalState(signalId: string, status: string): Promise<Signal> {
  // FastAPI exposes `status` as a query parameter, not a JSON request body.
  const { data } = await api.post<Signal>(`/signals/${signalId}/state`, undefined, { params: { status } });
  return data;
}

export async function fetchAlerts(): Promise<Alert[]> {
  const { data } = await api.get<Alert[]>("/alerts");
  return data;
}

export async function createAlert(title: string, description: string): Promise<Alert> {
  const { data } = await api.post<Alert>("/alerts", { title, description });
  return data;
}

export async function fetchAnalytics(): Promise<Record<string, number | string>> {
  const { data } = await api.get<Record<string, number | string>>("/analytics");
  return data;
}

export async function fetchEvents(): Promise<TrafficEvent[]> {
  const { data } = await api.get<TrafficEvent[]>("/events");
  return data.map((event) => ({
    ...event,
    event: event.event ?? event.message ?? "Realtime city event",
    timestamp: event.timestamp ?? event.created_at ?? "live",
    location: event.location ?? event.type ?? "ZONE-4",
  }));
}

export async function fetchPrediction(): Promise<AIRecommendation> {
  const { data } = await api.get<AIRecommendation>("/prediction");
  return data;
}

export async function fetchEmergencyVehicles(): Promise<EmergencyVehicle[]> {
  const { data } = await api.get<EmergencyVehicle[]>("/ambulance");
  return data;
}

export async function triggerEmergencyCorridor(
  ambulanceId: string = "AMB-102",
  destination: string = "Hospital Road"
): Promise<GreenCorridorResponse> {
  const { data } = await api.post<GreenCorridorResponse>("/ambulance/activate", {
    ambulanceId,
    destination,
  });
  return data;
}

export function openGreenFlowSocket(
  onMessage: (event: WebSocketMessage) => void,
  onError?: (error: unknown) => void,
  onClose?: () => void
): WebSocket {
  const socket = new WebSocket(wsUrl);

  socket.onmessage = (message) => {
    try {
      const parsed = JSON.parse(message.data) as WebSocketMessage | { type?: string; payload?: unknown };
      const normalizedMessage: WebSocketMessage = {
        type: normalizeWebSocketEventType(parsed?.type ?? ""),
        payload: parsed?.payload ?? parsed,
      };
      onMessage(normalizedMessage);
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  };

  socket.onerror = (event) => {
    console.error("WebSocket error:", event);
    onError?.(event);
  };

  socket.onclose = () => {
    onClose?.();
  };

  return socket;
}

export * from "./types";

export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError ?? new Error("Request failed");
}
