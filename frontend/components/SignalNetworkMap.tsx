"use client";

import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from "react-leaflet";
import type { Signal } from "@/lib/api";

function phaseColor(status: string) {
  if (status === "red") return "#e95b5b";
  if (status === "yellow") return "#d7a93e";
  return "#31d77b";
}

export function SignalNetworkMap({ signals, selectedId, onSelect, routeCoords = [], simulationActive = false }: { signals: Signal[]; selectedId: string | null; onSelect: (id: string) => void; routeCoords?: [number, number][]; simulationActive?: boolean }) {
  const located = signals.filter((signal) => Number.isFinite(signal.lat) && Number.isFinite(signal.lng) && (signal.lat !== 0 || signal.lng !== 0));
  if (!located.length) return <div className="ops-empty">No signal coordinates were returned by the API, so a network map cannot be rendered.</div>;
  const center: [number, number] = [located[0].lat, located[0].lng];
  return <div className="signal-map"><MapContainer center={center} zoom={13} scrollWheelZoom={false}><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{simulationActive && routeCoords.length > 1 && <Polyline positions={routeCoords} pathOptions={{ color: "#18f2ff", weight: 5, opacity: .9 }} />}{located.map((signal) => <CircleMarker key={signal.id} center={[signal.lat, signal.lng]} radius={signal.id === selectedId ? 11 : 8} pathOptions={{ color: "#e9fff2", weight: signal.id === selectedId ? 3 : 1, fillColor: phaseColor(signal.status), fillOpacity: .9 }} eventHandlers={{ click: () => onSelect(signal.id) }}><Popup><strong>{signal.id}</strong><br/>{signal.name}<br/>{signal.status}{simulationActive && <><br/>SIMULATION MAP</>}</Popup></CircleMarker>)}</MapContainer></div>;
}
