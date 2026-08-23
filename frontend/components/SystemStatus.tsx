"use client";

import { useEffect, useState } from "react";
import { checkSystemHealth, isDemoMode, type SystemMode, type SystemState } from "@/lib/system-status";

const labels: Record<SystemMode, string> = {
  LIVE: "LIVE CONNECTED", DEMO: "SIMULATION", STALE: "STALE DATA",
  OFFLINE: "OFFLINE", CONNECTING: "CONNECTING", RECONNECTING: "RECONNECTING",
};

export function SystemStatus({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<SystemState>({ mode: isDemoMode() ? "DEMO" : "CONNECTING", lastUpdated: null });

  useEffect(() => {
    if (isDemoMode()) return;
    let mounted = true;
    checkSystemHealth()
      .then(() => mounted && setState({ mode: "LIVE", lastUpdated: new Date() }))
      .catch(() => mounted && setState({ mode: "OFFLINE", lastUpdated: null, reason: "Live services unavailable" }));
    return () => { mounted = false; };
  }, []);

  const isLive = state.mode === "LIVE";
  return (
    <div className={`system-status system-status-${state.mode.toLowerCase()}`} role="status" aria-live="polite">
      <span aria-hidden="true">{isLive ? "[OK]" : "[!]"}</span>
      <strong>{labels[state.mode]}</strong>
      {!compact && state.mode === "DEMO" && <span>Demo data - not connected to live infrastructure</span>}
      {!compact && state.mode === "OFFLINE" && <span>Live commands unavailable</span>}
      {!compact && state.lastUpdated && <span>Updated {state.lastUpdated.toLocaleTimeString()}</span>}
    </div>
  );
}