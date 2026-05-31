"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  BarChart3, 
  BatteryCharging, 
  Bell, 
  Cpu, 
  Activity, 
  Wifi, 
  RadioTower, 
  CloudRain, 
  Layers, 
  Zap, 
  ShieldCheck,
  Ambulance,
  Clock
} from "lucide-react";

import { Card, cn } from "../../components/ui";
import { CommandCenterMap } from "../../components/command-center/CommandCenterMap";
import { 
  fetchDashboardMetrics, 
  fetchAlerts, 
  fetchEvents, 
  triggerEmergencyCorridor,
  retryRequest, 
  type DashboardMetrics, 
  type Alert, 
  type TrafficEvent,
  type GreenCorridorResponse
} from "../../lib/api";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const analyticsData = [
  { time: "00:00", value: 45 },
  { time: "04:00", value: 30 },
  { time: "08:00", value: 85 },
  { time: "12:00", value: 75 },
  { time: "16:00", value: 90 },
  { time: "20:00", value: 60 },
  { time: "23:59", value: 40 },
];

export default function CommandCenterPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [isEmergency, setIsEmergency] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [corridorStatusData, setCorridorStatusData] = useState<GreenCorridorResponse | null>(null);

  // Derived display values for hero tiles (defensive checks)
  const routeLengthDisplay = corridorStatusData
    ? (corridorStatusData.route_coords && corridorStatusData.route_coords.length > 0
        ? `${(corridorStatusData.route_coords.length / 1000).toFixed(1)} km`
        : corridorStatusData.route
          ? `${corridorStatusData.route.length} km`
          : '3.4 km')
    : '3.4 km';

  const signalsSyncedDisplay = corridorStatusData
    ? `${corridorStatusData.signalsSynced ?? corridorStatusData.signalsOptimized ?? 0} / ${corridorStatusData.signalsOptimized ?? corridorStatusData.signalsSynced ?? '18'}`
    : '18 / 18';

  const timeSavedDisplay = corridorStatusData
    ? `${corridorStatusData.timeSaved ?? corridorStatusData.etaAfter ?? '6.2m'}`
    : '6.2m';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashData, alertsData, eventsData] = await Promise.all([
          retryRequest(() => fetchDashboardMetrics()),
          retryRequest(() => fetchAlerts()),
          retryRequest(() => fetchEvents()),
        ]);
        setMetrics(dashData);
        setAlerts(alertsData.slice(0, 10));
        setEvents(eventsData.slice(0, 10));
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleEmergency = async () => {
    if (!isEmergency) {
        setIsEmergency(true);
        const startedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setEvents((prev) => [
          { id: Date.now(), event: "Emergency vehicle detected", timestamp: startedAt, location: "AMB-A204", type: "emergency" },
          { id: Date.now() + 1, event: "Green Corridor activated", timestamp: startedAt, location: "CORRIDOR", type: "green_corridor" },
          ...prev,
        ].slice(0, 10));
        setAlerts((prev) => [
          { id: Date.now(), title: "Green Corridor Active", description: "Vehicle A-204 routed to City General", severity: "critical" },
          ...prev,
        ].slice(0, 10));
        try {
        const resp = await triggerEmergencyCorridor("AMB-COMMAND", "City General");
        setCorridorStatusData(resp);
        } catch (e) {
            console.log("Emergency triggered (simulation mode)");
            setCorridorStatusData({
              status: "Green Corridor Activated",
              type: "green_corridor",
              ambulance: "A-204",
              vehicleId: "A-204",
              destination: "City General",
              etaBefore: 8,
              etaAfter: 4,
              timeSaved: 4,
              signalsOptimized: 4,
              signalsSynced: 4,
              route: ["SIG-01", "SIG-02", "SIG-03", "SIG-04"],
            });
        }
    } else {
        setIsEmergency(false);
      setCorridorStatusData(null);
    }
  };

  const simulateCongestion = () => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setEvents((prev) => [
      { id: Date.now(), event: "AI detected heavy congestion", timestamp: now, location: "Metro Junction", type: "ai" },
      { id: Date.now() + 1, event: "SIG-03 optimized +12 seconds", timestamp: now, location: "SIG-03", type: "signal" },
      ...prev,
    ].slice(0, 10));
    setAlerts((prev) => [
      { id: Date.now(), title: "Congestion Forecast", description: "Metro Junction risk raised to HIGH", severity: "warning" },
      ...prev,
    ].slice(0, 10));
  };

  return (
    <div className={cn(
      "mission-shell flex flex-col gap-6 min-h-screen rounded-lg p-5 transition-all duration-700",
      isEmergency && "emergency-mode-active"
    )}>
      <header className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-black tracking-[0.45em] text-primary uppercase">Smart City Operations Center</p>
            <h1 className="mt-2 text-4xl xl:text-6xl font-black tracking-normal text-white neon-text">REAL-TIME TRAFFIC INTELLIGENCE</h1>
            <p className="mt-3 text-sm text-text-secondary">AI-powered congestion prediction and emergency corridor automation</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatusPill label="SYSTEM ONLINE" />
            <StatusPill label="AI ENGINE ACTIVE" />
            <StatusPill label="SIGNAL NETWORK CONNECTED" />
            <StatusPill label="EMERGENCY NETWORK READY" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/15 bg-black/20 p-3">
          <button
            onClick={() => setDemoMode((value) => !value)}
            className={cn(
              "rounded-lg border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition",
              demoMode ? "border-success/40 bg-success/10 text-success shadow-neon-success" : "border-white/10 bg-white/5 text-text-secondary"
            )}
          >
            Demo Mode {demoMode ? "On" : "Off"}
          </button>
          <button onClick={simulateCongestion} className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-warning">
            Simulate Congestion
          </button>
          <button onClick={toggleEmergency} className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-danger">
            {isEmergency ? "End Emergency" : "Trigger Ambulance"}
          </button>
          <span className="text-[10px] font-semibold text-text-secondary">Judge Mode: predictable live events, visible corridor sync, and instant analytics impact.</span>
        </div>
      </header>
      
      {/* EMERGENCY OVERLAY HEADER */}
      <AnimatePresence>
        {isEmergency && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="warning-bar h-8 w-full flex items-center justify-center overflow-hidden"
          >
            <span className="text-white font-[900] text-sm tracking-[0.5em]">🚨 EMERGENCY MODE ACTIVE 🚨</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-[22%_53%_25%] gap-6 flex-1">
        
        {/* LEFT PANEL - AI & STATUS */}
        <aside className="space-y-6 flex flex-col h-full overflow-y-auto">
          
          {/* AI INTELLIGENCE */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">AI Command</h3>
            <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 220 }}>
              <Card className="glow-card p-5 space-y-4">
               <div className="flex items-center justify-between">
                <span className="text-xs font-[800] text-text-secondary uppercase">AI TRAFFIC HEALTH</span>
                <span className="text-success font-[900] text-2xl">82%</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "82%" }} 
                  transition={{ duration: 1.2 }}
                  className="h-full bg-success"
                />
               </div>
               <div className="pt-3 border-t border-border space-y-2">
                 <div className="flex justify-between items-center text-[10px] font-[600]">
                   <span className="text-text-secondary uppercase">Predicted Congestion</span>
                   <span className="text-warning uppercase font-[800]">High</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-[600]">
                   <span className="text-text-secondary uppercase">AI Confidence</span>
                   <span className="text-primary font-[800]">97%</span>
                 </div>
               </div>
              </Card>
            </motion.div>

            <Card className="glow-card p-5 border-warning/30 bg-warning/5">
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-warning" />
                    <span className="text-[10px] font-black tracking-widest text-warning uppercase">AI Recommendation</span>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-black text-white">Heavy congestion predicted</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <p className="text-text-secondary uppercase">Location</p>
                      <p className="font-bold text-primary">Metro Junction</p>
                    </div>
                    <div>
                      <p className="text-text-secondary uppercase">Confidence</p>
                      <p className="font-bold text-success">92%</p>
                    </div>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">
                    Action: <span className="text-warning font-bold">Extend green cycle +12s</span>
                  </p>
                </div>
            </Card>
          </section>

          {/* NETWORK STATUS */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">Network Status</h3>
            <div className="grid grid-cols-2 gap-3">
                <StatusSmall label="LATENCY" value="12ms" status="good" />
                <StatusSmall label="NODES" value="128/128" status="good" />
                <StatusSmall label="LOAD" value="44%" status="warn" />
                <StatusSmall label="UPTIME" value="99.9%" status="good" />
            </div>
          </section>

          {/* EMERGENCY STATUS */}
          <section className="space-y-4 flex-1">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">Emergency Status</h3>
            <Card className={cn("glow-card p-5 transition-colors duration-500 bg-card-background", isEmergency ? "border-danger/40" : "") }>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center border", isEmergency ? "bg-danger/20 border-danger text-danger" : "bg-white/5 border-white/10 text-text-secondary") }>
                      <Ambulance size={28} />
                    </div>
                    <div>
                      <h3 className="font-[900] text-lg uppercase">GREEN CORRIDOR CONTROL</h3>
                      <p className="text-[11px] text-text-secondary uppercase tracking-wide">Priority routing for emergency vehicles</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] text-text-secondary">Status</div>
                    <div className={cn("mt-1 font-[800] uppercase", isEmergency ? "text-danger" : "text-success")}>{isEmergency ? "EMERGENCY ACTIVE" : "STANDBY"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-secondary-background/60 rounded border border-border text-center">
                    <div className="text-[10px] text-text-secondary uppercase">Route Length</div>
                    <div className="font-[900] text-lg neon-text">{routeLengthDisplay}</div>
                  </div>
                  <div className="p-3 bg-secondary-background/60 rounded border border-border text-center">
                    <div className="text-[10px] text-text-secondary uppercase">Signals Synced</div>
                    <div className="font-[900] text-lg neon-text">{signalsSyncedDisplay}</div>
                  </div>
                  <div className="p-3 bg-secondary-background/60 rounded border border-border text-center">
                    <div className="text-[10px] text-text-secondary uppercase">Time Saved</div>
                    <div className="font-[900] text-lg neon-text">{timeSavedDisplay}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={toggleEmergency}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex-1 py-3 rounded-lg font-[900] text-sm tracking-widest transition-all",
                      isEmergency ? "bg-danger text-white shadow-neon" : "bg-primary text-background"
                    )}
                  >
                    {isEmergency ? "DEACTIVATE GREEN CORRIDOR" : "🚑 ACTIVATE GREEN CORRIDOR"}
                  </motion.button>

                  <button className="px-4 py-3 rounded-lg bg-secondary-background/50 border border-border text-[12px] font-[600]">VIEW ROUTE</button>
                </div>
              </div>
            </Card>
          </section>
        </aside>

        {/* CENTER PANEL - LIVE MAP */}
        <section className="flex flex-col gap-6 h-full">
           <div>
             <h2 className="text-[10px] font-black tracking-[0.35em] text-primary uppercase">City Operations Command Center</h2>
             <p className="mt-1 text-xs text-text-secondary">AI Traffic Intelligence • Emergency Routing • Green Corridor Control</p>
           </div>
           <Card className="flex-1 glow-card relative overflow-hidden bg-black/40 min-h-[560px]">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                 <div className="bg-secondary-background/80 backdrop-blur-md px-4 py-2 border border-border rounded flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-black tracking-widest uppercase">LIVE CITY OPERATIONS</span>
                 </div>
              </div>

              <div className="absolute bottom-4 right-4 z-10">
                 <div className="bg-secondary-background/80 backdrop-blur-md px-4 py-3 border border-border rounded-lg flex gap-6">
                    <MapLegend label="Green" color="#39FF88" />
                    <MapLegend label="Yellow" color="#FFC857" />
                    <MapLegend label="Red" color="#FF5252" />
                 </div>
              </div>
              {isEmergency && (
                <div className="absolute left-4 bottom-4 z-10 rounded-lg border border-success/30 bg-background/85 p-4 shadow-neon-success backdrop-blur-md">
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-success">Ambulance Detected</p>
                  <div className="mt-2 flex items-end gap-4">
                    <div>
                      <p className="text-[10px] text-text-secondary uppercase">ETA Before</p>
                      <p className="text-2xl font-black text-danger">{corridorStatusData?.etaBefore ?? 8}m</p>
                    </div>
                    <div className="pb-1 text-xl text-primary">→</div>
                    <div>
                      <p className="text-[10px] text-text-secondary uppercase">ETA After</p>
                      <p className="text-2xl font-black text-success">{corridorStatusData?.etaAfter ?? 4}m</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-secondary uppercase">Signals</p>
                      <p className="text-2xl font-black text-primary">{corridorStatusData?.signalsOptimized ?? 4}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full h-full min-h-[500px]">
                 <CommandCenterMap isEmergency={isEmergency} />
              </div>
           </Card>

           {/* BOTTOM SECTION - ANALYTICS */}
           <div className="h-[250px] grid grid-cols-2 gap-6">
              <Card className="glow-card p-6">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">Traffic Impact Metrics</h3>
                    <BarChart3 size={14} className="text-primary" />
                 </div>
                 <div className="flex-1 h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="time" hide />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0D1B24', border: '1px solid rgba(0,229,255,0.2)', fontSize: '10px' }}
                                itemStyle={{ color: '#00E5FF' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#00E5FF" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                 <MetricBox label="DELAY REDUCED" value="24%" sub="System Avg" trend="up" color="success" />
                 <MetricBox label="TIME SAVED" value="12.4 min" sub="Today" trend="up" color="success" />
                 <MetricBox label="CO₂ SAVED" value="4.2 Ton" sub="Verified" trend="up" color="primary" />
                 <MetricBox label="EMERGENCIES HANDLED" value="37" sub="Priority Runs" trend="up" color="primary" />
              </div>
           </div>
        </section>

        {/* RIGHT PANEL - WIRE FEED */}
        <aside className="space-y-6 flex flex-col h-full overflow-y-auto">
            
            <section className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">Wire Intelligence Feed</h3>
                    <div className="flex items-center gap-1 text-[8px] font-bold text-primary animate-pulse">
                        <Activity size={10} />
                        LIVE
                    </div>
                </div>
                
                <Card className="glow-card flex-1 flex flex-col p-0 overflow-hidden bg-black/20">
                    <div className="bg-secondary-background/50 px-4 py-2 border-b border-border flex items-center justify-between">
                        <span className="text-[9px] font-black text-text-secondary tracking-widest uppercase">Powered by Anakin Wire</span>
                    </div>
                    <div className="p-4 space-y-4 overflow-y-auto max-h-[400px]">
                        {events.map((event, i) => {
                          const eventText = event.event ?? event.message ?? "Realtime city event";
                          const eventLocation = event.location ?? event.type ?? "ZONE-4";
                          const eventTime = event.timestamp ?? event.created_at ?? "live";
                          const isEmergencyEvent = eventText.includes("Emergency") || eventText.includes("Corridor") || eventLocation.includes("emergency");
                          return (
                          <motion.div key={i} whileHover={{ scale: 1.02 }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex gap-3 items-start group">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shadow-neon shrink-0" />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-bold text-text-secondary">{eventTime}</span>
                                <span className={cn(
                                  "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                                  isEmergencyEvent ? "bg-danger/20 text-danger" : "bg-primary/20 text-primary"
                                )}>{eventLocation}</span>
                              </div>
                              <p className="text-[11px] font-medium leading-tight group-hover:text-primary transition-colors cursor-default">
                                {eventText}
                              </p>
                            </div>
                          </motion.div>
                        )})}
                    </div>
                </Card>
            </section>

            <section className="space-y-4">
                <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">Operations Log</h3>
                <div className="space-y-3">
                   <Card className="glow-card p-4 border-l-4 border-l-warning">
                      <div className="flex items-center gap-2 mb-1">
                        <CloudRain size={12} className="text-warning" />
                        <span className="text-[10px] font-black uppercase text-warning">Weather Alert</span>
                      </div>
                      <p className="text-[11px] text-text-secondary">Light rain detected in Sector 7. Surface friction coefficient reduced by 15%.</p>
                   </Card>

                   <Card className="glow-card p-4 border-l-4 border-l-danger">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={12} className="text-danger" />
                        <span className="text-[10px] font-black uppercase text-danger">Road Closure</span>
                      </div>
                      <p className="text-[11px] text-text-secondary">Main St Eastbound closed due to maintenance. AI rerouting active.</p>
                   </Card>
                </div>
            </section>

        </aside>

      </div>
    </div>
  );
}

function StatusSmall({ label, value, status }: { label: string, value: string, status: 'good' | 'warn' | 'crit' }) {
    const color = status === 'good' ? 'text-success' : status === 'warn' ? 'text-warning' : 'text-danger';
    return (
        <Card className="glow-card p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[8px] font-black text-text-secondary tracking-widest uppercase mb-1">{label}</span>
            <span className={cn("text-xs font-black", color)}>{value}</span>
        </Card>
    )
}

function StatusPill({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-3 py-2 shadow-neon-success">
            <span className="h-2 w-2 rounded-full bg-success shadow-neon-success animate-pulse" />
            <span className="whitespace-nowrap text-[8px] font-black uppercase tracking-widest text-success">{label}</span>
        </div>
    )
}

function MetricBox({ label, value, sub, color }: { label: string, value: string, sub: string, trend: 'up' | 'down', color: 'success' | 'primary' | 'danger' }) {
  const textColor = color === 'success' ? 'text-success' : color === 'primary' ? 'text-primary' : 'text-danger';
  return (
    <motion.div whileHover={{ y: -6 }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <Card className="glow-card p-5 flex min-h-[112px] flex-col justify-between">
        <span className="text-[9px] font-black text-text-secondary tracking-widest uppercase">{label}</span>
        <div className="my-1">
          <span className={cn("text-3xl font-black tracking-normal", textColor)}>{value}</span>
        </div>
        <span className="text-[9px] font-bold text-text-secondary uppercase opacity-60">{sub}</span>
      </Card>
    </motion.div>
  )
}

function MapLegend({ label, color }: { label: string, color: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">{label}</span>
        </div>
    )
}
