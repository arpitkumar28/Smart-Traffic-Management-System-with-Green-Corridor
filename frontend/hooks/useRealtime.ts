"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeRealtime, type RealtimeStatus } from "@/lib/realtime";
import type { NormalizedEventType, WebSocketMessage } from "@/lib/types";

export type RealtimeHandler = (type: NormalizedEventType, payload: unknown, raw?: WebSocketMessage) => void;

export default function useRealtime(
  onEvent: RealtimeHandler | null,
  onError?: (err: unknown) => void,
  onClose?: () => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<RealtimeStatus>("OFFLINE");
  const eventHandlerRef = useRef(onEvent);
  const errorHandlerRef = useRef(onError);
  const closeHandlerRef = useRef(onClose);

  useEffect(() => {
    eventHandlerRef.current = onEvent;
    errorHandlerRef.current = onError;
    closeHandlerRef.current = onClose;
  }, [onEvent, onError, onClose]);

  useEffect(() => {
    return subscribeRealtime({
      onEvent: (type, payload, raw) => eventHandlerRef.current?.(type, payload, raw),
      onStatus: (nextStatus) => {
        setStatus(nextStatus);
        if (nextStatus === "OFFLINE") closeHandlerRef.current?.();
      },
    });
  }, []);

  return { socketRef, status };
}
