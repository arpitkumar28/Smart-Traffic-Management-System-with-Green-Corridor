"use client";

import { useEffect, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { fetchSignals, retryRequest, type Signal } from "@/lib/api";

const icon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 20px ${color}"></div>`,
  });

export function LiveMap() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  
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
      ) : (
        <MapContainer center={mapCenter} zoom={14} className="h-full w-full">
          <TileLayer attribution="OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {route.length > 1 && <Polyline positions={route} color="#8cff5a" weight={7} />}
          {route.length > 0 && (
            <>
              <Marker position={route[route.length - 1]} icon={icon("#18f2ff")}>
                <Popup>Destination</Popup>
              </Marker>
              <Marker position={route[0]} icon={icon("#8cff5a")}>
                <Popup>Ambulance Position</Popup>
              </Marker>
            </>
          )}
          {signals.map((signal) => (
            <Marker 
              key={signal.id} 
              position={[signal.lat, signal.lng]} 
              icon={icon(getStatusColor(signal.status))}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{signal.name}</p>
                  <p>Status: {signal.status}</p>
                  <p>Load: {Math.round(signal.traffic_load)}%</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
