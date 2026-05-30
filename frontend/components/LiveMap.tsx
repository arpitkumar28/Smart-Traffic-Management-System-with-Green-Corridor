"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchSignals, retryRequest, type Signal, openGreenFlowSocket, type EmergencyVehicle, type WebSocketMessage } from "@/lib/api";

export default function LiveMap() {
  const [mounted, setMounted] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [emergencyVehicles, setEmergencyVehicles] = useState<EmergencyVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [MapComponents, setMapComponents] = useState<any>(null);

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

    // Fetch initial signals
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
    
    // Set up WebSocket for real-time updates (Emergency Vehicles, Signal Updates)
    const socket = openGreenFlowSocket((msg: WebSocketMessage) => {
      if (msg.type === "EMERGENCY_VEHICLE_UPDATE") {
        const vehicle = msg.payload as EmergencyVehicle;
        setEmergencyVehicles(prev => {
          const index = prev.findIndex(v => v.id === vehicle.id);
          if (index > -1) {
            const next = [...prev];
            next[index] = vehicle;
            return next;
          }
          return [...prev, vehicle];
        });
      } else if (msg.type === "SIGNAL_UPDATE") {
        const updatedSignal = msg.payload as Signal;
        setSignals(prev => prev.map(s => s.id === updatedSignal.id ? updatedSignal : s));
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

  const isValidCoord = (item: { lat: number, lng: number }) => item && typeof item.lat === 'number' && typeof item.lng === 'number';

  const defaultCenter: [number, number] = [28.6139, 77.209];
  const activeSignals = signals.filter(isValidCoord);
  
  const mapCenter: [number, number] = activeSignals.length > 0 
    ? [activeSignals[0].lat, activeSignals[0].lng] 
    : defaultCenter;

  const greenCorridorRoute: [number, number][] = activeSignals
    .filter(s => s.status === "priority")
    .map(s => [s.lat, s.lng] as [number, number]);

  const getTrafficColor = (load: number) => {
    if (load > 80) return "#ff3b30"; // Heavy (Red)
    if (load > 40) return "#ffb020"; // Medium (Yellow)
    return "#8cff5a"; // Low (Green)
  };

  const getSignalStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "red") return "#ff3b30";
    if (s === "yellow") return "#ffb020";
    if (s === "priority") return "#00f2ff"; // Cyan for Green Corridor
    return "#8cff5a"; // Green
  };

  return (
    <div className="h-[calc(100vh-10rem)] w-full overflow-hidden rounded-xl border border-white/10 bg-[#07171b] shadow-2xl">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          className="map-tiles"
        />
        
        {/* Green Corridor Polyline */}
        {greenCorridorRoute.length > 1 && (
          <Polyline 
            positions={greenCorridorRoute} 
            color="#00f2ff" 
            weight={8} 
            opacity={0.6} 
            dashArray="10, 15"
          />
        )}

        {/* Signal Markers with Congestion Heatmap */}
        {activeSignals.map((signal) => {
          const signalIcon = L.divIcon({
            className: "signal-icon",
            html: `
              <div style="
                width: 24px; 
                height: 24px; 
                background: ${getSignalStatusColor(signal.status)}; 
                border: 3px solid #000; 
                border-radius: 50%; 
                box-shadow: 0 0 15px ${getSignalStatusColor(signal.status)};
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="width: 8px; height: 8px; background: white; border-radius: 50%; opacity: 0.5;"></div>
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
                      <span className="font-bold uppercase" style={{ color: getSignalStatusColor(signal.status) }}>{signal.status}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Congestion:</span> 
                      <span className="font-bold" style={{ color: getTrafficColor(signal.traffic_load) }}>
                        {signal.traffic_load > 80 ? "Heavy" : signal.traffic_load > 40 ? "Medium" : "Low"}
                      </span>
                    </p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ width: `${signal.traffic_load}%`, backgroundColor: getTrafficColor(signal.traffic_load) }}
                      />
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Emergency Vehicle Markers */}
        {emergencyVehicles.map((vehicle) => {
          const vehicleIcon = L.divIcon({
            className: "emergency-icon",
            html: `
              <div class="animate-pulse" style="
                width: 32px; 
                height: 32px; 
                background: #ff3b30; 
                border: 2px solid white; 
                border-radius: 6px; 
                box-shadow: 0 0 20px #ff3b30;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
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
                  <h3 className="font-bold text-red-600">EMERGENCY: {vehicle.type.toUpperCase()}</h3>
                  <p className="text-xs mt-1">ID: {vehicle.id}</p>
                  {vehicle.destination && <p className="text-xs">Destination: {vehicle.destination}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-6 right-6 z-[1000] rounded-lg border border-white/10 bg-[#07171b]/90 p-4 text-xs text-white shadow-xl backdrop-blur-md">
        <h4 className="mb-2 font-bold uppercase tracking-wider text-cyan">Live Indicators</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#8cff5a]" /> <span>Low Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ffb020]" /> <span>Medium Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff3b30]" /> <span>Heavy Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]" /> <span>Green Corridor Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🚑 / 🚒</span> <span>Emergency Vehicle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
