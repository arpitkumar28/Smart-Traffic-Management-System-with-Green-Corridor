"use client";

import { useEffect, useState } from "react";
import { mapSensors, greenCorridorRoute } from "../../lib/commandCenterData";
import { HeatLayerFallback } from "./HeatLayerFallback";

interface MapProps {
  isEmergency?: boolean;
}

export function CommandCenterMap({ isEmergency }: MapProps) {
  const [reactLeaflet, setReactLeaflet] = useState<any>(null);
  const [L, setL] = useState<any>(null);
  const [vehiclePosition, setVehiclePosition] = useState<[number, number] | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    Promise.all([
      import("react-leaflet"),
      import("leaflet")
    ]).then(([RL, Leaflet]) => {
      setReactLeaflet(RL);
      setL(Leaflet.default || Leaflet);
    }).catch((error) => console.error("Failed to load map libraries:", error));
  }, []);

  // smooth animate a vehicle along the route using requestAnimationFrame
  useEffect(() => {
    let rafId: number | null = null;
    if (!isEmergency || !greenCorridorRoute || greenCorridorRoute.length < 2) {
      setVehiclePosition(null);
      return;
    }

    const path = greenCorridorRoute;
    const segmentDuration = 1000; // ms per segment
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const totalDuration = segmentDuration * path.length;
      const mod = elapsed % totalDuration;
      const rawIndex = Math.floor(mod / segmentDuration);
      const t = (mod % segmentDuration) / segmentDuration;
      const a = path[rawIndex];
      const b = path[(rawIndex + 1) % path.length];
      const lat = a[0] * (1 - t) + b[0] * t;
      const lng = a[1] * (1 - t) + b[1] * t;
      setVehiclePosition([lat, lng]);
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isEmergency]);

  if (!reactLeaflet || !L) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
           <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Initializing Global Grid</span>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, ZoomControl, Marker } = reactLeaflet;

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[37.781, -122.399]}
        zoom={14}
        zoomControl={false}
        className="h-full w-full"
        whenCreated={(map: any) => setMapInstance(map)}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Heatmap layer (leaflet.heat if available) */}
        {/* Fallback: keep subtle circles if plugin not present */}
        {mapInstance && L && (
          <HeatLayerFallback map={mapInstance} L={L} />
        )}

        {isEmergency && (
          <Polyline
            positions={greenCorridorRoute}
            pathOptions={{ 
              color: "#00FF88", 
              weight: 6, 
              opacity: 0.95,
              dashArray: "8, 8",
              lineCap: "round",
              className: "green-route"
            }}
          />
        )}

        {mapSensors.map((sensor: any) => {
          const color = sensor.status === "priority" ? "#00FF88" : sensor.status === "red" ? "#FF5252" : "#FFC857";
          const isActive = isEmergency && sensor.status === "priority";
          
          return (
            <CircleMarker
              key={sensor.id}
              center={sensor.position}
              pathOptions={{ 
                color: isActive ? "#00FF88" : color, 
                fillColor: isActive ? "#00FF88" : color, 
                fillOpacity: 0.9, 
                weight: isActive ? 4 : 2,
                className: isActive ? "emergency-pulse" : "" 
              }}
              radius={isActive ? 12 : 8}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                <div className="bg-card border border-border p-2 rounded text-[10px] font-bold uppercase tracking-wider">
                  <div className="text-text-primary mb-1">{sensor.label}</div>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                     <span style={{ color }}>{sensor.status}</span>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* moving emergency vehicle marker */}
        {isEmergency && L && Marker && vehiclePosition && (
          <Marker
            key={`veh-anim`}
            position={vehiclePosition}
            icon={L.divIcon({
              className: '',
              html: `<div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(45deg,#00FF88,#00E5FF);box-shadow:0 0 12px rgba(0,255,136,0.25);border:2px solid rgba(255,255,255,0.06)" class="route-pulse"></div>`
            })}
          />
        )}

          {isEmergency && (
            <CircleMarker
             center={greenCorridorRoute[0]}
             pathOptions={{ color: '#00FF88', fillColor: '#00FF88', fillOpacity: 1, weight: 2, className: 'route-pulse' }}
             radius={12}
            >
              <Tooltip permanent direction="right" offset={[15, 0]}>
                <div className="bg-danger px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-tighter">
                  AMB-UNIT-7
                </div>
              </Tooltip>
            </CircleMarker>
          )}
        
        <ZoomControl position="bottomright" />
      </MapContainer>

      <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
         <div className="bg-secondary-background/80 backdrop-blur-md border border-border p-3 rounded flex flex-col gap-2">
            <div className="flex items-center justify-between gap-8">
               <span className="text-[8px] font-black text-text-secondary uppercase">Satellite Link</span>
               <span className="text-[8px] font-black text-success uppercase">Active</span>
            </div>
            <div className="flex items-center justify-between gap-8">
               <span className="text-[8px] font-black text-text-secondary uppercase">Coordinate Drift</span>
               <span className="text-[8px] font-black text-text-primary uppercase">0.0004s</span>
            </div>
         </div>
      </div>
    </div>
  );
}
