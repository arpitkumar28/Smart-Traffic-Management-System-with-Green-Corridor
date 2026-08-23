import { api } from "@/lib/api";

export type SystemMode = "LIVE" | "DEMO" | "STALE" | "OFFLINE" | "CONNECTING" | "RECONNECTING";

export interface SystemState {
  mode: SystemMode;
  lastUpdated: Date | null;
  reason?: string;
}

export async function checkSystemHealth(): Promise<void> {
  await api.get("/health");
}

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}