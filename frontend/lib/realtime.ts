"use client";

import { normalizeWebSocketEventType, wsUrl } from "./api";
import type { NormalizedEventType, WebSocketMessage } from "./types";

export type RealtimeStatus = "LIVE" | "CONNECTING" | "RECONNECTING" | "OFFLINE" | "STALE";
export type RealtimeHandler = (type: NormalizedEventType, payload: unknown, raw: WebSocketMessage) => void;

type Listener = { onEvent: RealtimeHandler; onStatus: (status: RealtimeStatus) => void };

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let staleTimer: ReturnType<typeof setTimeout> | null = null;
let status: RealtimeStatus = "OFFLINE";
const listeners = new Set<Listener>();

function publishStatus(nextStatus: RealtimeStatus) {
  status = nextStatus;
  listeners.forEach((listener) => listener.onStatus(status));
}

function clearTimers() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (staleTimer) clearTimeout(staleTimer);
  reconnectTimer = null;
  staleTimer = null;
}

function scheduleReconnect() {
  if (listeners.size === 0 || reconnectTimer) return;
  publishStatus("RECONNECTING");
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, 1500);
}

function connect() {
  if (socket || listeners.size === 0) return;
  publishStatus(status === "OFFLINE" ? "CONNECTING" : "RECONNECTING");
  try {
    socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      publishStatus("LIVE");
      if (staleTimer) clearTimeout(staleTimer);
      staleTimer = setTimeout(() => publishStatus("STALE"), 30000);
    };
    socket.onmessage = (message) => {
      try {
        const parsed = JSON.parse(message.data) as WebSocketMessage;
        const raw = { type: parsed?.type ?? "", payload: parsed?.payload ?? parsed };
        const normalized = { ...raw, type: normalizeWebSocketEventType(raw.type) };
        if (staleTimer) clearTimeout(staleTimer);
        staleTimer = setTimeout(() => publishStatus("STALE"), 30000);
        listeners.forEach((listener) => listener.onEvent(normalized.type, normalized.payload, normalized));
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };
    socket.onerror = () => publishStatus("OFFLINE");
    socket.onclose = () => {
      socket = null;
      if (listeners.size > 0) scheduleReconnect();
      else publishStatus("OFFLINE");
    };
  } catch (error) {
    socket = null;
    publishStatus("OFFLINE");
    scheduleReconnect();
    console.error("Failed to connect to GreenFlow realtime:", error);
  }
}

export function subscribeRealtime(listener: Listener): () => void {
  listeners.add(listener);
  listener.onStatus(status);
  connect();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearTimers();
      socket?.close();
      socket = null;
      publishStatus("OFFLINE");
    }
  };
}
