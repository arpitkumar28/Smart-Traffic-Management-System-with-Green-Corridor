"use client";

import { useEffect, useState } from "react";
import { fetchSignals, retryRequest, type Signal } from "@/lib/api";

function createIcon(L: typeof import("leaflet"), color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 20px ${color}"></div>`,
  });
}

export function LiveMap() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [leafletModule, setLeafletModule] = useState<typeof import("leaflet") | null>(null);
  const [reactLeaflet, setReactLeaflet] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window === "undefined") return;

    Promise.all([import("react-leaflet"), import("leaflet")])
      .then(([RL, L]) => {
        setReactLeaflet(RL);
        setLeafletModule(L);
      })
      .catch((error) => console.error("Failed to load map libraries in browser:", error));
  }, []);

  // Default Delhi city center
  const defaultCenter: [number, number] = [28.6139, 77.209];
  
  // Create route from signals or use default
  const route: [number, number][] = signals.length > 0 
    ? signals.map(s => [s.lat, s.lng] as [number, number])
    : [
        [28.6139, 77.209],
        [28.6162, 77.212],
        [28.6187, 77.2144],
        [28.622, 77.2188],
      ];

  const mapCenter: [number, number] = signals.length > 0 
    ? [signals[0].lat, signals[0].lng]
    : defaultCenter;

  useEffect(() => {
    const loadSignals = async () => {
      try {
        setLoading(true);
        const data = await retryRequest(() => fetchSignals());
        setSignals(data);
      } catch (err) {
        console.error("Failed to load signals:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSignals();
    const interval = setInterval(loadSignals, 15000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "red":
        return "#ff3b30";
      case "yellow":
        return "#ffb020";
      case "green":
        return "#8cff5a";
      case "priority":
        return "#8cff5a";
      default:
        return "#18f2ff";
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] overflow-hidden rounded-lg border border-cyan/15 bg-[#07171b]">
      {loading && signals.length === 0 ? (
        <div className="h-full w-full flex items-center justify-center text-white/50">
          Loading map data...
        </div>
      ) : reactLeaflet ? (
        <reactLeaflet.MapContainer center={mapCenter} zoom={14} className="h-full w-full">
          <reactLeaflet.TileLayer attribution="OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {route.length > 1 && <reactLeaflet.Polyline positions={route} color="#8cff5a" weight={7} />}
          {route.length > 0 && (
            <>
              <reactLeaflet.Marker
                position={route[route.length - 1]}
                icon={leafletModule ? createIcon(leafletModule, "#18f2ff") : undefined}
              >
                <reactLeaflet.Popup>Destination</reactLeaflet.Popup>
              </reactLeaflet.Marker>
              <reactLeaflet.Marker
                position={route[0]}
                icon={leafletModule ? createIcon(leafletModule, "#8cff5a") : undefined}
              >
                <reactLeaflet.Popup>Ambulance Position</reactLeaflet.Popup>
              </reactLeaflet.Marker>
            </>
          )}
          {signals.map((signal) => (
            <reactLeaflet.Marker
              key={signal.id}
              position={[signal.lat, signal.lng]}
              icon={leafletModule ? createIcon(leafletModule, getStatusColor(signal.status)) : undefined}
            >
              <reactLeaflet.Popup>
                <div className="text-sm">
                  <p className="font-bold">{signal.name}</p>
                  <p>Status: {signal.status}</p>
                  <p>Load: {Math.round(signal.traffic_load)}%</p>
                </div>
              </reactLeaflet.Popup>
            </reactLeaflet.Marker>
          ))}
        </reactLeaflet.MapContainer>
      ) : (
        <div className="h-full w-full flex items-center justify-center text-white/50">
          Loading map UI...
        </div>
      )}
    </div>
  );
}
