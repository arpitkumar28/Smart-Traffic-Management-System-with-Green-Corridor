"use client";

import { useEffect, useState } from "react";
import { fetchSignals, retryRequest, type Signal, openGreenFlowSocket, type EmergencyVehicle, type WebSocketMessage } from "@/lib/api";

const DEFAULT_SIGNALS: Signal[] = [
  { id: "metro-junction", name: "Metro Junction", lat: 28.6139, lng: 77.209, status: "red", traffic_load: 82 },
  { id: "hospital-road", name: "Hospital Road", lat: 28.6159, lng: 77.215, status: "green", traffic_load: 35 },
  { id: "civic-center", name: "Civic Center", lat: 28.6328, lng: 77.2195, status: "yellow", traffic_load: 65 },
  { id: "south-park", name: "South Park", lat: 28.6000, lng: 77.2300, status: "green", traffic_load: 22 },
];

export default function LiveMap() {
  const [mounted, setMounted] = useState(false);
  const [signals, setSignals] = useState<Signal[]>(DEFAULT_SIGNALS);
  const [emergencyVehicles, setEmergencyVehicles] = useState<EmergencyVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [MapComponents, setMapComponents] = useState<any>(null);
  const [activeRoute, setActiveRoute] = useState<[number, number][]>([]);

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
        if (Array.isArray(data) && data.length > 0) {
          // Merge API signals with defaults to ensure specific junctions are present
          const apiSignals = data.filter(s => s.lat && s.lng);
          const merged = [...DEFAULT_SIGNALS];
          apiSignals.forEach(as => {
            const idx = merged.findIndex(ms => ms.id === as.id || ms.name === as.name);
            if (idx > -1) merged[idx] = as;
            else merged.push(as);
          });
          setSignals(merged);
        }
      } catch (err) {
        console.error("Signal fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSignals();
    
    // Set up WebSocket for real-time updates
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
        
        // If it's a new emergency, simulate route highlighting
        if (vehicle.destination) {
          // Mock route for demo: current position to a signal
          setActiveRoute([[vehicle.lat, vehicle.lng], [28.6139, 77.209], [28.6159, 77.215]]);
        }
      } else if (msg.type === "SIGNAL_UPDATE") {
        const updatedSignal = msg.payload as Signal;
        setSignals(prev => prev.map(s => s.id === updatedSignal.id ? updatedSignal : s));
      } else if (msg.type === "GREEN_CORRIDOR_ACTIVATED") {
          // Highlight route and update signals to green/priority
          const payload = msg.payload;
          if (payload.route_coords) {
              setActiveRoute(payload.route_coords);
          }
          if (payload.signal_ids) {
              setSignals(prev => prev.map(s => 
                  payload.signal_ids.includes(s.id) ? { ...s, status: "priority" } : s
              ));
          }
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
    if (s === "priority" || s === "green_corridor") return "#00f2ff"; // Cyan for Green Corridor
    return "#8cff5a"; // Green
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
        
        {/* Active Route / Green Corridor Polyline */}
        {activeRoute.length > 1 && (
          <Polyline 
            positions={activeRoute} 
            color="#00f2ff" 
            weight={10} 
            opacity={0.8} 
            dashArray="1, 15"
            lineCap="round"
          />
        )}

        {/* Signal Markers */}
        {activeSignals.map((signal) => {
          const statusColor = getSignalStatusColor(signal.status);
          const signalIcon = L.divIcon({
            className: "signal-icon",
            html: `
              <div style="
                width: 28px; 
                height: 28px; 
                background: ${statusColor}; 
                border: 2px solid white; 
                border-radius: 50%; 
                box-shadow: 0 0 20px ${statusColor};
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.5s ease;
              ">
                <div style="width: 6px; height: 6px; background: white; border-radius: 50%; opacity: 0.8;"></div>
              </div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
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
              <div class="animate-bounce" style="
                width: 36px; 
                height: 36px; 
                background: #ff3b30; 
                border: 3px solid white; 
                border-radius: 8px; 
                box-shadow: 0 0 25px #ff3b30;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 20px;
                z-index: 1000;
              ">
                ${vehicle.type === "ambulance" ? "🚑" : "🚒"}
              </div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
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
            <div className="h-3 w-3 rounded-full bg-[#8cff5a]" /> <span>🟢 Green (Low)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ffb020]" /> <span>🟡 Yellow (Medium)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff3b30]" /> <span>🔴 Red (Heavy)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]" /> <span>🔵 Priority Corridor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🚑</span> <span>Emergency Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
