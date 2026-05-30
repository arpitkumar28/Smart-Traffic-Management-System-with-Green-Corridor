"use client";

import { useEffect, useState } from "react";
import { mapSensors, greenCorridorRoute } from "@/lib/commandCenterData";

export function CommandCenterMap() {
  const [reactLeaflet, setReactLeaflet] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    import("react-leaflet")
      .then((RL) => setReactLeaflet(RL))
      .catch((error) => console.error("Failed to load React-Leaflet:", error));
  }, []);

  return (
    <div className="h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#081a21] shadow-[0_0_80px_rgba(24,242,255,0.08)]">
      {reactLeaflet ? (
        <reactLeaflet.MapContainer
          center={[37.781, -122.399]}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <reactLeaflet.TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <reactLeaflet.Polyline
            positions={greenCorridorRoute}
            pathOptions={{ color: "#8cff5a", weight: 5, opacity: 0.88 }}
          />

          {mapSensors.map((sensor) => {
            const color = sensor.status === "priority" ? "#8cff5a" : sensor.status === "red" ? "#ff7a45" : "#18f2ff";
            return (
              <reactLeaflet.CircleMarker
                key={sensor.id}
                center={sensor.position}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}
                radius={11}
              >
                <reactLeaflet.Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="text-sm leading-tight">
                    <div className="font-semibold">{sensor.label}</div>
                    <div className="text-xs text-slate-900">Signal {sensor.status.toUpperCase()}</div>
                  </div>
                </reactLeaflet.Tooltip>
              </reactLeaflet.CircleMarker>
            );
          })}
        </reactLeaflet.MapContainer>
      ) : (
        <div className="h-full w-full flex items-center justify-center text-white/50">
          Loading map visualization...
        </div>
      )}
    </div>
  );
}
