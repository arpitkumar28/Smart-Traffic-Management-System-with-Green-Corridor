import axios from "axios";

export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
export const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://127.0.0.1:8000/ws";

export const api = axios.create({ baseURL: apiUrl });

export async function triggerEmergencyCorridor() {
  const { data } = await api.post("/ambulance/activate", {
    ambulanceId: "A-204",
    destination: "City Hospital",
  });
  return data as {
    status: string;
    etaBefore: number;
    etaAfter: number;
    timeSaved: number;
  };
}

export function openGreenFlowSocket(onMessage: (event: { type: string; payload: unknown }) => void) {
  const socket = new WebSocket(wsUrl);
  socket.onmessage = (message) => onMessage(JSON.parse(message.data));
  return socket;
}
