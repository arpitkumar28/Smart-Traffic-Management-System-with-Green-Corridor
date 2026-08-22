// Centralized TypeScript types for GreenFlow frontend

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
  status: "green" | "yellow" | "red" | "priority" | string;
  traffic_load: number;
  lat: number;
  lng: number;
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

export interface AIRecommendation {
  zone: string;
  risk: string;
  confidence: number;
  currentTraffic?: string;
  predictedTraffic?: string;
  recommendedAction: string;
}

export interface WebSocketMessage<T = any> {
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
  | string;

const types = {};
export default types;
