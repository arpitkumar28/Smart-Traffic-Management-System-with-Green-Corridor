"use client";

import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { signals } from "@/lib/data";

const route: [number, number][] = [
  [28.6139, 77.209],
  [28.6162, 77.212],
  [28.6187, 77.2144],
  [28.622, 77.2188],
];

const icon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 20px ${color}"></div>`,
  });

export function LiveMap() {
  return (
    <div className="h-[calc(100vh-7rem)] overflow-hidden rounded-lg border border-cyan/15">
      <MapContainer center={[28.6178, 77.214]} zoom={14} className="h-full w-full">
        <TileLayer attribution="OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={route} color="#8cff5a" weight={7} />
        <Marker position={route[route.length - 1]} icon={icon("#18f2ff")}>
          <Popup>City Hospital</Popup>
        </Marker>
        <Marker position={route[0]} icon={icon("#8cff5a")}>
          <Popup>Ambulance A-204</Popup>
        </Marker>
        {signals.map((signal, index) => (
          <Marker key={signal.id} position={route[Math.min(index, route.length - 1)]} icon={icon(signal.status === "red" ? "#ff3b30" : signal.status === "yellow" ? "#ffb020" : "#8cff5a")}>
            <Popup>{signal.id}: {signal.status}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
