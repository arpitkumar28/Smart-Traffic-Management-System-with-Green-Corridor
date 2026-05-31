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
    const segmentDuration = 2000; // ms per segment - slowed down for better "wow"
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const totalDuration = segmentDuration * (path.length - 1);
      const mod = elapsed % totalDuration;
      const rawIndex = Math.floor(mod / segmentDuration);
      const t = (mod % segmentDuration) / segmentDuration;
      
      if (rawIndex < path.length - 1) {
        const a = path[rawIndex];
        const b = path[rawIndex + 1];
        const lat = a[0] * (1 - t) + b[0] * t;
        const lng = a[1] * (1 - t) + b[1] * t;
        setVehiclePosition([lat, lng]);
      }
      
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isEmergency]);

  if (!reactLeaflet || !L) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
           <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Syncing Satellite Uplink</span>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, ZoomControl, Marker, Circle } = reactLeaflet;

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
          className="map-tiles grayscale contrast-125 invert"
        />

        {/* Heatmap layer fallback */}
        {mapInstance && L && (
          <HeatLayerFallback map={mapInstance} L={L} />
        )}

        {/* Static background routes */}
        <Polyline
          positions={greenCorridorRoute}
          pathOptions={{ 
            color: "#00E5FF", 
            weight: 2, 
            opacity: 0.15,
            dashArray: "4, 10",
            lineCap: "round"
          }}
        />

        {/* Heat Zones for Congestion */}
        {[
          { center: [37.778, -122.397], color: "#FF4D4D", radius: 350, label: "Metro Junction", load: "92%" },
          { center: [37.783, -122.401], color: "#FFC857", radius: 250, label: "Tech Park", load: "64%" },
        ].map((zone: any) => (
          <div key={zone.label}>
            <Circle
              center={zone.center}
              radius={zone.radius}
              pathOptions={{
                fillColor: zone.color,
                fillOpacity: 0.08,
                color: zone.color,
                weight: 1,
                dashArray: '5, 5'
              }}
            />
             <Marker
                position={zone.center}
                icon={L.divIcon({
                  className: 'label-icon',
                  html: `<div class="bg-[#030712]/80 backdrop-blur-md border border-${zone.color === "#FF4D4D" ? "danger" : "warning"}/30 px-2 py-1 rounded text-[8px] font-black whitespace-nowrap">
                           <span class="text-${zone.color === "#FF4D4D" ? "danger" : "warning"}">🔴 ${zone.label.toUpperCase()}</span>
                           <br/><span class="text-white/40">CONGESTION: ${zone.load}</span>
                         </div>`,
                  iconAnchor: [40, 45]
                })}
              />
          </div>
        ))}

        {/* Emergency Path Animation */}
        {isEmergency && (
          <>
            <Polyline
              positions={greenCorridorRoute}
              pathOptions={{ 
                color: "#00FF9D", 
                weight: 10, 
                opacity: 0.2,
                lineCap: "round",
              }}
            />
            <Polyline
              positions={greenCorridorRoute}
              pathOptions={{ 
                color: "#00FF9D", 
                weight: 4, 
                opacity: 0.8,
                dashArray: "1, 15",
                lineCap: "round",
                className: "animate-route-flow"
              }}
            />
          </>
        )}

        {/* Network Nodes / Sensors */}
        {mapSensors.map((sensor: any) => {
          const isCongested = sensor.status === "red";
          const isPriority = isEmergency && sensor.status === "priority";
          const color = isPriority ? "#00E5FF" : isCongested ? "#FF4D4D" : "#FFC857";
          
          return (
            <CircleMarker
              key={sensor.id}
              center={sensor.position}
              pathOptions={{ 
                color: color, 
                fillColor: color, 
                fillOpacity: 0.9, 
                weight: isPriority ? 4 : 2,
                className: isPriority ? "priority-pulse" : isCongested ? "congestion-pulse" : "signal-dot" 
              }}
              radius={isPriority ? 10 : 7}
            >
              <Tooltip permanent direction="top" offset={[0, -10]} opacity={0.9}>
                <div className="flex flex-col items-center">
                   <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-tighter border ${
                     isPriority ? 'bg-cyan text-black border-cyan/50' : 
                     isCongested ? 'bg-red-500 text-white border-red-400' : 'bg-slate-800 text-slate-300 border-white/10'
                   }`}>
                    {isPriority ? '🚨 PRIORITY' : isCongested ? '🔴 CONGESTED' : '🟡 BUSY'}
                   </span>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Hospital Destination */}
        {L && Marker && (
          <Marker
            key="hospital-marker"
            position={greenCorridorRoute[greenCorridorRoute.length - 1]}
            icon={L.divIcon({
              className: '',
              html: `<div class="relative">
                      <div class="absolute -inset-4 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                      <div style="padding:8px;border-radius:12px;background:#030712;border:2px solid #00E5FF;box-shadow:0 0 20px rgba(0,229,255,.4);font-size:20px;position:relative">🏥</div>
                    </div>`
            })}
          >
            <Tooltip permanent direction="right" offset={[20, 0]}>
              <div className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-primary">City General Hospital</div>
            </Tooltip>
          </Marker>
        )}

        {/* moving emergency vehicle marker */}
        {L && Marker && (
          <Marker
            key={`veh-anim-${isEmergency ? "active" : "standby"}`}
            position={isEmergency && vehiclePosition ? vehiclePosition : greenCorridorRoute[0]}
            icon={L.divIcon({
              className: '',
              html: `<div class="relative ${isEmergency ? "vehicle-glow" : ""}">
                      <div style="width:36px;height:36px;border-radius:10px;background:#030712;border:2px solid ${isEmergency ? "#00FF9D" : "#FF4D4D"};box-shadow:0 0 25px ${isEmergency ? "rgba(0,255,157,0.4)" : "rgba(255,77,77,0.2)"};display:grid;place-items:center;font-size:20px">🚑</div>
                      ${isEmergency ? `
                        <div class="absolute left-12 top-1/2 -translate-y-1/2 bg-[#00FF9D] text-black px-3 py-1 rounded-full text-[9px] font-black whitespace-nowrap shadow-xl border border-white/20">
                          EN ROUTE ⚡ HOSPITAL
                        </div>
                      ` : ''}
                    </div>`
            })}
          />
        )}
        
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Floating Network Stats Panel */}
      <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
         <div className="bg-[#030712]/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_#00ff9d]" />
               <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Signal Sync Status</span>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center gap-8">
                   <span className="text-[9px] font-bold text-white/40 uppercase">Latency</span>
                   <span className="text-[10px] font-black text-primary">12ms</span>
                </div>
                <div className="flex justify-between items-center gap-8">
                   <span className="text-[9px] font-bold text-white/40 uppercase">Sync Dev</span>
                   <span className="text-[10px] font-black text-success">0.02s</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 w-[94%]"></div>
                </div>
            </div>
         </div>
      </div>

      <style jsx global>{`
        @keyframes priority-pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.4); transform: scale(1); }
          70% { box-shadow: 0 0 0 15px rgba(0, 229, 255, 0); transform: scale(1.2); }
          100% { box-shadow: 0 0 0 0 rgba(0, 229, 255, 0); transform: scale(1); }
        }
        @keyframes congestion-pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255, 77, 77, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); }
        }
        @keyframes route-flow {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        .animate-route-flow {
          animation: route-flow 2s linear infinite;
        }
        .priority-pulse {
          animation: priority-pulse 1.5s infinite;
        }
        .congestion-pulse {
          animation: congestion-pulse 2s infinite;
        }
        .vehicle-glow {
          filter: drop-shadow(0 0 15px rgba(0, 255, 157, 0.4));
        }
        .map-tiles {
            filter: invert(100%) hue-rotate(180deg) brightness(0.5) contrast(1.2) !important;
        }
        .leaflet-container {
            background: #030712 !important;
        }
        .label-icon {
            background: transparent !important;
            border: none !important;
        }
      `}</style>
    </div>
  );
}
