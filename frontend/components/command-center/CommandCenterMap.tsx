"use client";

import { MapContainer, Polyline, TileLayer, Tooltip, CircleMarker } from "react-leaflet";
import { mapSensors, greenCorridorRoute } from "@/lib/commandCenterData";

export function CommandCenterMap() {
  return (
    <div className="h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#081a21] shadow-[0_0_80px_rgba(24,242,255,0.08)]">
      <MapContainer
        center={[37.781, -122.399]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={greenCorridorRoute}
          pathOptions={{ color: "#8cff5a", weight: 5, opacity: 0.88 }}
        />

        {mapSensors.map((sensor) => {
          const color = sensor.status === "priority" ? "#8cff5a" : sensor.status === "red" ? "#ff7a45" : "#18f2ff";
          return (
            <CircleMarker
              key={sensor.id}
              center={sensor.position}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}
              radius={11}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div className="text-sm leading-tight">
                  <div className="font-semibold">{sensor.label}</div>
                  <div className="text-xs text-slate-900">Signal {sensor.status.toUpperCase()}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
