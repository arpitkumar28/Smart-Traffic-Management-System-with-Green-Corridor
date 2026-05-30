"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchSignals, retryRequest, type Signal } from "@/lib/api";

// We strictly avoid top-level imports of 'leaflet' or 'react-leaflet'
// as they often touch the 'window' object immediately upon evaluation.

export default function LiveMap() {
  const [mounted, setMounted] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [MapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    const initMap = async () => {
      try {
        if (typeof window === "undefined") return;

        // Import Leaflet and React-Leaflet dynamically
        const [LModule, RLModule] = await Promise.all([
          import("leaflet"),
          import("react-leaflet"),
        ]);

        const L = LModule.default || LModule;

        // Fix for Leaflet default marker icons in Next.js
        if (L.Icon && L.Icon.Default) {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          });
        }

        setMapComponents({
          L,
          MapContainer: RLModule.MapContainer,
          TileLayer: RLModule.TileLayer,
          Marker: RLModule.Marker,
          Popup: RLModule.Popup,
          Polyline: RLModule.Polyline,
        });
      } catch (err) {
        console.error("Critical: Failed to load map library:", err);
      }
    };

    initMap();

    const loadSignals = async () => {
      try {
        const data = await retryRequest(() => fetchSignals());
        if (Array.isArray(data)) {
          setSignals(data);
        }
      } catch (err) {
        console.error("Signal fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSignals();
    const interval = setInterval(loadSignals, 15000);
    return () => clearInterval(interval);
  }, []);

  // Return a safe loading state during SSR and while engine is initializing
  if (!mounted || !MapComponents) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center rounded-xl border border-white/10 bg-[#07171b] text-white/50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan border-t-transparent" />
          <p className="text-sm font-black tracking-widest uppercase text-cyan/70">Syncing Satellite Uplink...</p>
        </div>
      </div>
    );
  }

  const { L, MapContainer, TileLayer, Marker, Popup, Polyline } = MapComponents;

  // Helper to ensure coordinates are valid numbers
  const isValidCoord = (s: Signal) => s && typeof s.lat === 'number' && typeof s.lng === 'number';

  const defaultCenter: [number, number] = [28.6139, 77.209];
  const activeSignals = signals.filter(isValidCoord);
  
  const mapCenter: [number, number] = activeSignals.length > 0 
    ? [activeSignals[0].lat, activeSignals[0].lng] 
    : defaultCenter;

  const route: [number, number][] = activeSignals.map(s => [s.lat, s.lng] as [number, number]);

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "red") return "#ff3b30";
    if (s === "yellow") return "#ffb020";
    return "#8cff5a"; // green/priority
  };

  return (
    <div className="h-[calc(100vh-10rem)] w-full overflow-hidden rounded-xl border border-white/10 bg-[#07171b] shadow-2xl">
      <MapContainer 
        center={mapCenter} 
        zoom={14} 
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        
        {route.length > 1 && (
          <Polyline positions={route} color="#8cff5a" weight={6} opacity={0.4} dashArray="8, 12" />
        )}

        {activeSignals.map((signal) => {
          const icon = L.divIcon({
            className: "custom-div-icon",
            html: `<div style="width:20px;height:20px;border-radius:50%;background:${getStatusColor(signal.status)};border:2px solid white;box-shadow:0 0 15px ${getStatusColor(signal.status)}"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          return (
            <Marker
              key={signal.id}
              position={[signal.lat, signal.lng]}
              icon={icon}
            >
              <Popup>
                <div className="p-1 text-slate-900 min-w-[120px]">
                  <h3 className="font-bold border-b border-slate-200 pb-1">{signal.name}</h3>
                  <div className="mt-2 space-y-1 text-[11px]">
                    <p className="flex justify-between">
                      <span>Status:</span> 
                      <span className="font-bold uppercase" style={{ color: getStatusColor(signal.status) }}>{signal.status}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Traffic Load:</span> 
                      <span className="font-bold">{Math.round(signal.traffic_load)}%</span>
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
