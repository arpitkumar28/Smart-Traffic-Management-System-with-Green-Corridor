"use client";

import { useEffect, useRef } from "react";
import { normalizeWebSocketEventType, openGreenFlowSocket } from "@/lib/api";
import type { NormalizedEventType, WebSocketMessage } from "@/lib/types";

export type RealtimeHandler = (type: NormalizedEventType, payload: unknown, raw?: WebSocketMessage) => void;

export default function useRealtime(
  onEvent: RealtimeHandler | null,
  onError?: (err: unknown) => void,
  onClose?: () => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const eventHandlerRef = useRef(onEvent);
  const errorHandlerRef = useRef(onError);
  const closeHandlerRef = useRef(onClose);

  useEffect(() => {
    eventHandlerRef.current = onEvent;
    errorHandlerRef.current = onError;
    closeHandlerRef.current = onClose;
  }, [onEvent, onError, onClose]);

  useEffect(() => {
    if (!eventHandlerRef.current) return;

    const socket = openGreenFlowSocket((msg: WebSocketMessage) => {
      try {
        const type = normalizeWebSocketEventType(msg.type);
        eventHandlerRef.current?.(type, msg.payload, msg);
      } catch (error) {
        console.error("Realtime message handler error:", error);
      }
    }, (error) => errorHandlerRef.current?.(error), () => closeHandlerRef.current?.());

    socketRef.current = socket;

    return () => {
      try {
        socket.close();
      } catch {
        // no-op
      }
      socketRef.current = null;
    };
  }, []);

  return socketRef;
}
