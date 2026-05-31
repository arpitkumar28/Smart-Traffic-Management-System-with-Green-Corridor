import axios, { AxiosError } from "axios";

export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://smart-traffic-management-system-with.onrender.com";
export const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "wss://smart-traffic-management-system-with.onrender.com/ws";

export const api = axios.create({ baseURL: apiUrl, timeout: 10000 });

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardMetrics {
  trafficFlow: number;
  vehiclesPerMinute: number;
  avgWait: number;
  activeSignals: number;
  emergencyVehiclesActive: number;
  aiPredictionConfidence: number;
}

export interface Signal {
  id: string;
  name: string;
  status: "green" | "yellow" | "red" | "priority";
  traffic_load: number;
  lat: number;
  lng: number;
}

export interface EmergencyVehicle {
  id: string;
  type: "ambulance" | "fire_brigade";
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
  id: number;
  event: string;
  timestamp: string;
  /** Optional location or zone identifier for the event */
  location?: string;
}

export interface AnalyticsData {
  metric: string;
  value: number;
  timestamp?: string;
}

export interface GreenCorridorResponse {
  status: string;
  type: string;
  ambulance: string;
  vehicleId: string;
  destination: string;
  etaBefore: number;
  etaAfter: number;
  timeSaved: number;
  signalsOptimized: number;
  signalsSynced?: number;
  route: string[];
  route_coords?: [number, number][];
  priorityScore?: number;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

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
    const statusCode = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.message ||
      "An error occurred while fetching data";
    return new APIError(statusCode, message, error);
  }
  return new APIError(500, String(error));
}

// ============================================================================
// DASHBOARD
// ============================================================================

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const { data } = await api.get<DashboardMetrics>("/dashboard");
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// ============================================================================
// SIGNALS
// ============================================================================

export async function fetchSignals(): Promise<Signal[]> {
  try {
    const { data } = await api.get<Signal[]>("/signals");
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updateSignalState(
  signalId: string,
  status: string
): Promise<Signal> {
  try {
    const { data } = await api.post<Signal>(
      `/signals/${signalId}/state`,
      { status }
    );
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// ============================================================================
// ALERTS
// ============================================================================

export async function fetchAlerts(): Promise<Alert[]> {
  try {
    const { data } = await api.get<Alert[]>("/alerts");
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function createAlert(
  title: string,
  description: string
): Promise<Alert> {
  try {
    const { data } = await api.post<Alert>("/alerts", { title, description });
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

export async function fetchAnalytics(): Promise<Record<string, unknown>> {
  try {
    const { data } = await api.get<Record<string, unknown>>("/analytics");
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// ============================================================================
// EVENTS
// ============================================================================

export async function fetchEvents(): Promise<TrafficEvent[]> {
  try {
    const { data } = await api.get<TrafficEvent[]>("/events");
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// ============================================================================
// PREDICTION
// ============================================================================

export interface AIRecommendation {
  zone: string;
  risk: string;
  confidence: number;
  currentTraffic?: string;
  predictedTraffic?: string;
  recommendedAction: string;
}

export async function fetchPrediction(): Promise<AIRecommendation> {
  try {
    const { data } = await api.get<AIRecommendation>("/prediction");
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// ============================================================================
// AMBULANCE / EMERGENCY
// ============================================================================

export async function fetchEmergencyVehicles(): Promise<EmergencyVehicle[]> {
    try {
      const { data } = await api.get<EmergencyVehicle[]>("/ambulance");
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

export async function triggerEmergencyCorridor(
  ambulanceId: string = "AMB-102",
  destination: string = "Hospital Road"
): Promise<GreenCorridorResponse> {
  try {
    const { data } = await api.post<GreenCorridorResponse>(
      "/ambulance/activate",
      {
        ambulanceId,
        destination,
      }
    );
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// ============================================================================
// WEBSOCKET
// ============================================================================

export interface WebSocketMessage {
  type: string;
  payload: any;
}

export function openGreenFlowSocket(
  onMessage: (event: WebSocketMessage) => void,
  onError?: (error: any) => void,
  onClose?: () => void
): WebSocket {
  const socket = new WebSocket(wsUrl);

  socket.onmessage = (message) => {
    try {
      const event = JSON.parse(message.data) as WebSocketMessage;
      onMessage(event);
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  };

  socket.onerror = (event) => {
    console.error("WebSocket error:", event);
    onError?.(event);
  };

  socket.onclose = () => {
    console.log("WebSocket closed");
    onClose?.();
  };

  return socket;
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}
