"use client";

import { useEffect, useState } from "react";
import { 
  fetchSignals, 
  fetchEmergencyVehicles,
  retryRequest, 
  type Signal, 
  openGreenFlowSocket, 
  type EmergencyVehicle, 
  type WebSocketMessage,
  type GreenCorridorResponse
} from "@/lib/api";

export default function LiveMap() {
  const [mounted, setMounted] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [emergencyVehicles, setEmergencyVehicles] = useState<EmergencyVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [MapComponents, setMapComponents] = useState<any>(null);
  const [activeRoute, setActiveRoute] = useState<[number, number][]>([]);
  const [corridorData, setCorridorData] = useState<GreenCorridorResponse | null>(null);

  useEffect(() => {
    setMounted(true);

    const initMap = async () => {
      try {
        if (typeof window === "undefined") return;

        const [LModule, RLModule] = await Promise.all([
          import("leaflet"),
          import("react-leaflet"),
        ]);

        const L = LModule.default || LModule;

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

    const loadData = async () => {
      try {
        const [signalsData, vehiclesData] = await Promise.all([
            retryRequest(() => fetchSignals()),
            retryRequest(() => fetchEmergencyVehicles())
        ]);
        setSignals(signalsData);
        setEmergencyVehicles(vehiclesData);
      } catch (err) {
        console.error("Initial data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    const socket = openGreenFlowSocket((msg: WebSocketMessage) => {
      console.log("WebSocket Message:", msg);
      
      switch (msg.type) {
        case "SIGNAL_UPDATE":
          if (msg.payload.signals) {
            setSignals(msg.payload.signals);
          }
          break;
          
        case "GREEN_CORRIDOR_ACTIVATED":
          const payload = msg.payload as GreenCorridorResponse;
          setCorridorData(payload);
          if (payload.route_coords) {
            setActiveRoute(payload.route_coords);
          }
          // Also fetch vehicles again to see updated positions/status
          fetchEmergencyVehicles().then(setEmergencyVehicles).catch(console.error);
          break;

        case "EMERGENCY_VEHICLE_UPDATE":
            fetchEmergencyVehicles().then(setEmergencyVehicles).catch(console.error);
            break;
            
        case "ANALYTICS_UPDATE":
            // Analytics are handled by the Analytics page or global state if needed
            break;
      }
    });

    return () => {
      socket.close();
    };
  }, []);

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

  const defaultCenter: [number, number] = [28.6139, 77.209];
  const mapCenter: [number, number] = defaultCenter;

  const getTrafficColor = (load: number) => {
    if (load > 80) return "#ff3b30"; // Heavy (Red)
    if (load > 40) return "#ffb020"; // Medium (Yellow)
    return "#8cff5a"; // Low (Green)
  };

  const getSignalStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "red") return "#ff3b30";
    if (s === "yellow") return "#ffb020";
    if (s === "priority" || s === "green_corridor") return "#00f2ff"; 
    return "#8cff5a"; 
  };

  return (
    <div className="h-[calc(100vh-10rem)] w-full overflow-hidden rounded-xl border border-white/10 bg-[#07171b] shadow-2xl relative">
      <MapContainer 
        center={mapCenter} 
        zoom={14} 
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          className="map-tiles grayscale contrast-125 invert"
        />
        
        {activeRoute.length > 1 && (
          <Polyline 
            positions={activeRoute} 
            color="#00f2ff" 
            weight={8} 
            opacity={0.6} 
            dashArray="10, 10"
            lineCap="round"
          />
        )}

        {signals.map((signal) => {
          const statusColor = getSignalStatusColor(signal.status);
          const isPriority = signal.status === "priority";
          const signalIcon = L.divIcon({
            className: "signal-icon",
            html: `
              <div style="
                width: 24px; 
                height: 24px; 
                background: ${statusColor}; 
                border: 2px solid white; 
                border-radius: 50%; 
                box-shadow: 0 0 ${isPriority ? '25px' : '10px'} ${statusColor};
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.5s ease;
                ${isPriority ? 'animation: pulse 1s infinite;' : ''}
              ">
                <div style="width: 4px; height: 4px; background: white; border-radius: 50%; opacity: 0.8;"></div>
              </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          return (
            <Marker
              key={signal.id}
              position={[signal.lat, signal.lng]}
              icon={signalIcon}
            >
              <Popup>
                <div className="p-2 text-slate-900 min-w-[150px]">
                  <h3 className="font-bold border-b border-slate-200 pb-1 text-sm">{signal.name}</h3>
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="flex justify-between">
                      <span>Signal:</span> 
                      <span className="font-bold uppercase" style={{ color: statusColor }}>{signal.status}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Congestion:</span> 
                      <span className="font-bold" style={{ color: getTrafficColor(signal.traffic_load) }}>
                        {signal.traffic_load > 80 ? "Heavy" : signal.traffic_load > 40 ? "Medium" : "Low"}
                      </span>
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {emergencyVehicles.map((vehicle) => {
          const isActive = vehicle.status === "Green Corridor Active";
          const vehicleIcon = L.divIcon({
            className: "emergency-icon",
            html: `
              <div class="${isActive ? 'animate-bounce' : ''}" style="
                width: 32px; 
                height: 32px; 
                background: ${isActive ? '#00f2ff' : '#ff3b30'}; 
                border: 2px solid white; 
                border-radius: 6px; 
                box-shadow: 0 0 20px ${isActive ? '#00f2ff' : '#ff3b30'};
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
                z-index: 1000;
              ">
                ${vehicle.type === "ambulance" ? "🚑" : "🚒"}
              </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          return (
            <Marker
              key={vehicle.id}
              position={[vehicle.lat, vehicle.lng]}
              icon={vehicleIcon}
            >
              <Popup>
                <div className="p-2 text-slate-900">
                  <h3 className="font-bold text-red-600">{vehicle.type.toUpperCase()}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">ID: {vehicle.id}</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <p><span className="text-slate-500">Status:</span> <span className="font-bold text-cyan">{vehicle.status}</span></p>
                    {vehicle.destination && <p><span className="text-slate-500">Target:</span> <span className="font-bold">{vehicle.destination}</span></p>}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Corridor Stats Overlay */}
      {corridorData && (
          <div className="absolute top-6 left-6 z-[1000] max-w-xs animate-in slide-in-from-left duration-500">
              <div className="rounded-xl border border-cyan/40 bg-[#07171b]/95 p-4 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded bg-cyan/20 flex items-center justify-center text-cyan animate-pulse">
                        <span className="text-xl">🚑</span>
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-cyan uppercase tracking-widest">Active Corridor</p>
                          <p className="text-sm font-bold text-white">Ambulance {corridorData.ambulance}</p>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-3">
                      <div>
                          <p className="text-[9px] text-white/40 uppercase font-bold">Time Saved</p>
                          <p className="text-lg font-black text-lime">-{corridorData.timeSaved}m</p>
                      </div>
                      <div>
                          <p className="text-[9px] text-white/40 uppercase font-bold">Signals Sync</p>
                          <p className="text-lg font-black text-cyan">{corridorData.signalsSynced}</p>
                      </div>
                  </div>
                  <div className="mt-3 bg-white/5 rounded p-2 border border-white/5">
                      <p className="text-[9px] text-white/40 uppercase font-bold mb-1">Destination</p>
                      <p className="text-xs font-bold text-white/80">{corridorData.destination}</p>
                  </div>
              </div>
          </div>
      )}
      
      {/* Map Legend */}
      <div className="absolute bottom-6 right-6 z-[1000] rounded-lg border border-white/10 bg-[#07171b]/90 p-4 text-[10px] text-white shadow-xl backdrop-blur-md">
        <h4 className="mb-2 font-black uppercase tracking-wider text-cyan/70 border-b border-white/5 pb-1">Network Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#8cff5a]" /> <span>Green (Low Traffic)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#ffb020]" /> <span>Yellow (Medium)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#ff3b30]" /> <span>Red (Heavy Congestion)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]" /> <span>Priority Corridor</span>
          </div>
          <div className="flex items-center gap-3 mt-1 pt-1 border-t border-white/5">
            <span className="text-base">🚑</span> <span>Ambulance</span>
            <span className="text-base">🚒</span> <span>Fire Dept</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .leaflet-container {
            background: #07171b !important;
        }
        .map-tiles {
            filter: invert(100%) hue-rotate(180deg) brightness(0.6) contrast(1.2) !important;
        }
      `}</style>
    </div>
  );
}
