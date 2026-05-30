"use client";

import { useEffect, useState } from "react";
import { mapSensors, greenCorridorRoute } from "@/lib/commandCenterData";
import { motion } from "framer-motion";

interface MapProps {
  isEmergency?: boolean;
}

export function CommandCenterMap({ isEmergency }: MapProps) {
  const [reactLeaflet, setReactLeaflet] = useState<any>(null);
  const [L, setL] = useState<any>(null);

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

  const { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, ZoomControl } = reactLeaflet;

  // Custom marker icon logic for Leaflet if needed, but CircleMarkers are better for "Command Center" look
  
  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[37.781, -122.399]}
        zoom={14}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Heatmap / Congestion Zones - Simulating with semi-transparent circles */}
        <CircleMarker 
           center={[37.785, -122.405]} 
           radius={60} 
           pathOptions={{ fillColor: '#FF5252', fillOpacity: 0.1, stroke: false }} 
        />
        <CircleMarker 
           center={[37.775, -122.395]} 
           radius={40} 
           pathOptions={{ fillColor: '#FFC857', fillOpacity: 0.1, stroke: false }} 
        />

        {/* Emergency Route */}
        {isEmergency && (
          <Polyline
            positions={greenCorridorRoute}
            pathOptions={{ 
              color: "#00FF88", 
              weight: 6, 
              opacity: 0.8,
              dashArray: "1, 12",
              lineCap: "round"
            }}
          />
        )}

        {/* Traffic Signals */}
        {mapSensors.map((sensor) => {
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
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9} className="custom-tooltip">
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

        {/* Emergency Vehicle Marker */}
        {isEmergency && (
           <CircleMarker
             center={greenCorridorRoute[0]}
             pathOptions={{ color: '#00FF88', fillColor: '#00FF88', fillOpacity: 1, weight: 2 }}
             radius={10}
           >
              <Tooltip permanent direction="right" offset={[15, 0]} className="vehicle-tooltip">
                 <div className="bg-danger px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-tighter">
                    AMB-UNIT-7
                 </div>
              </Tooltip>
           </CircleMarker>
        )}
        
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Map Overlay HUD elements */}
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
