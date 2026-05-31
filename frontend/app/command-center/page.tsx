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
  Clock,
  BrainCircuit,
  Terminal
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
      "mission-shell flex flex-col gap-6 min-h-screen rounded-lg p-5 transition-all duration-700 bg-[#030712]",
      isEmergency && "emergency-mode-active"
    )}>
      <header className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[11px] font-black tracking-[0.45em] text-primary uppercase">Smart City Operations Center</p>
            <h1 className="mt-2 text-4xl xl:text-6xl font-black tracking-tighter text-white">GREENFLOW <span className="text-primary italic">AI</span></h1>
            <p className="mt-3 text-sm text-text-secondary font-medium">AI-powered congestion prediction and emergency corridor automation</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-end max-w-2xl">
            <StatusPill label="SYSTEM ONLINE" />
            <StatusPill label="AI ENGINE ACTIVE" />
            <StatusPill label="SIGNAL NETWORK CONNECTED" />
            <StatusPill label="EMERGENCY NETWORK READY" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-2xl">
          <button
            onClick={() => setDemoMode((value) => !value)}
            className={cn(
              "premium-btn",
              demoMode ? "border-success/40 text-success shadow-[0_0_15px_rgba(0,255,157,0.2)]" : "border-white/10 text-text-secondary"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full mr-2", demoMode ? "bg-success animate-pulse" : "bg-white/20")} />
            DEMO MODE {demoMode ? "ACTIVE" : "OFF"}
          </button>
          
          <button onClick={simulateCongestion} className="premium-btn border-warning/30 text-warning hover:bg-warning/5 hover:shadow-[0_0_20px_rgba(255,200,87,0.2)]">
            <Zap size={14} className="mr-2" />
            SIMULATE CONGESTION
          </button>
          
          <button onClick={toggleEmergency} className={cn(
            "premium-btn flex-1 md:flex-none justify-center",
            isEmergency 
              ? "border-danger text-danger bg-danger/10 shadow-[0_0_25px_rgba(255,77,77,0.3)] animate-pulse" 
              : "border-primary/40 text-primary hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]"
          )}>
            <Ambulance size={14} className="mr-2" />
            {isEmergency ? "ABORT EMERGENCY PROTOCOL" : "TRIGGER EMERGENCY DEMO"}
          </button>
          
          <div className="hidden lg:flex items-center gap-2 ml-auto px-4 py-2 bg-white/5 rounded-lg border border-white/5">
             <Terminal size={12} className="text-primary/60" />
             <span className="text-[10px] font-bold text-text-secondary tracking-tight">JUDGE MODE: INTERACTIVE SCENARIOS ENABLED</span>
          </div>
        </div>
      </header>
      
      {/* EMERGENCY OVERLAY HEADER */}
      <AnimatePresence>
        {isEmergency && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-danger/20 border-y border-danger/30 h-10 w-full flex items-center justify-center overflow-hidden"
          >
            <motion.span 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-danger font-black text-xs tracking-[0.5em] uppercase"
            >
              🚨 PRIORITY EMERGENCY CORRIDOR ENGAGED 🚨
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-[22%_53%_25%] gap-6 flex-1">
        
        {/* LEFT PANEL - AI & STATUS */}
        <aside className="space-y-6 flex flex-col h-full overflow-y-auto">
          
          {/* AI DECISION ENGINE CARD */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase flex items-center gap-2">
                <BrainCircuit size={12} className="text-primary" />
                AI Decision Engine
            </h3>
            
            <motion.div whileHover={{ y: -4 }}>
              <Card className="glass-card p-5 space-y-4 border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">System Reasoning</span>
                    <div className="px-2 py-0.5 rounded bg-primary text-black text-[9px] font-black italic">ACTIVE</div>
                </div>
                
                <div className="space-y-3">
                    <div className="flex gap-3">
                        <div className="w-1 h-auto bg-primary/30 rounded-full" />
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-white/90">• Congestion predicted in 18 min</p>
                            <p className="text-[11px] font-bold text-white/90">• Ambulance ETA optimized</p>
                            <p className="text-[11px] font-bold text-white/90">• Signal 12 extended by 8 sec</p>
                            <p className="text-[11px] font-bold text-white/90">• Corridor activated</p>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-text-secondary font-bold">AI CONFIDENCE</span>
                            <span className="text-primary font-black text-sm">98.2%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: "98.2%" }} 
                                className="h-full bg-primary shadow-[0_0_10px_#00e5ff]"
                            />
                        </div>
                    </div>
                </div>
              </Card>
            </motion.div>

            <Card className="glass-card p-5 border-warning/30 bg-warning/5">
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-warning" />
                    <span className="text-[10px] font-black tracking-widest text-warning uppercase">AI Recommendation</span>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-black text-white">Metro Junction Congestion: 92%</p>
                  <p className="text-xs font-medium leading-relaxed text-white/70">
                    Proactive intervention suggested to prevent gridlock at Sector 4 exit.
                  </p>
                  <button className="w-full py-2 bg-warning/20 border border-warning/30 rounded text-[10px] font-black text-warning uppercase hover:bg-warning/30 transition-all">
                    EXECUTE OPTIMIZATION
                  </button>
                </div>
            </Card>
          </section>

          {/* NETWORK STATUS */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">Network Infrastructure</h3>
            <div className="grid grid-cols-2 gap-3">
                <StatusSmall label="LATENCY" value="12ms" status="good" />
                <StatusSmall label="NODES" value="128/128" status="good" />
                <StatusSmall label="AI LOAD" value="44%" status="good" />
                <StatusSmall label="UPTIME" value="99.9%" status="good" />
            </div>
          </section>

          {/* EMERGENCY STATUS */}
          <section className="space-y-4 flex-1">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">Emergency Control</h3>
            <Card className={cn("glass-card p-5 transition-all duration-500", isEmergency ? "border-danger/50 bg-danger/5 shadow-[0_0_30px_rgba(255,77,77,0.1)]" : "bg-card-background") }>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", isEmergency ? "bg-danger text-white border-danger" : "bg-white/5 border-white/10 text-text-secondary") }>
                      <Ambulance size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase text-white tracking-tight">Green Corridor</h3>
                      <p className={cn("text-[10px] font-black uppercase tracking-widest", isEmergency ? "text-danger" : "text-success")}>{isEmergency ? "ACTIVE INTERVENTION" : "SYSTEM STANDBY"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-white/5 rounded border border-white/5 text-center">
                    <div className="text-[8px] text-text-secondary uppercase font-black">Route</div>
                    <div className="font-black text-xs text-white mt-0.5">{routeLengthDisplay}</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded border border-white/5 text-center">
                    <div className="text-[8px] text-text-secondary uppercase font-black">Sync</div>
                    <div className="font-black text-xs text-white mt-0.5">{signalsSyncedDisplay}</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded border border-white/5 text-center">
                    <div className="text-[8px] text-text-secondary uppercase font-black">Saved</div>
                    <div className="font-black text-xs text-success mt-0.5">{timeSavedDisplay}</div>
                  </div>
                </div>

                <button
                    onClick={toggleEmergency}
                    className={cn(
                      "w-full py-3 rounded-lg font-black text-[10px] tracking-[0.2em] transition-all border uppercase",
                      isEmergency ? "bg-danger text-white border-danger shadow-[0_0_20px_rgba(255,77,77,0.4)]" : "bg-white/5 text-white border-white/10 hover:border-primary/50"
                    )}
                >
                    {isEmergency ? "TERMINATE CORRIDOR" : "MANUAL TRIGGER"}
                </button>
              </div>
            </Card>
          </section>
        </aside>

        {/* CENTER PANEL - LIVE MAP */}
        <section className="flex flex-col gap-6 h-full">
           <Card className="flex-1 glass-card relative overflow-hidden bg-black min-h-[560px] border-white/10">
              {/* Floating Map UI Overlay */}
              <div className="absolute top-4 left-4 z-10 space-y-2">
                 <div className="bg-[#030712]/80 backdrop-blur-xl px-4 py-2 border border-white/10 rounded-lg flex items-center gap-3 shadow-2xl">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_10px_#00ff9d]" />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">LIVE OPERATIONS FEED</span>
                 </div>
                 
                 {isEmergency && (
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="bg-danger/90 backdrop-blur-xl px-4 py-3 border border-danger/50 rounded-lg shadow-2xl"
                    >
                        <p className="text-[9px] font-black uppercase tracking-widest text-white mb-1">Active Emergency</p>
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-[8px] text-white/60 uppercase">Unit</p>
                                <p className="text-sm font-black text-white">AMB-204</p>
                            </div>
                            <div className="w-[1px] h-6 bg-white/10" />
                            <div>
                                <p className="text-[8px] text-white/60 uppercase">ETA</p>
                                <p className="text-sm font-black text-success">3.2m</p>
                            </div>
                        </div>
                    </motion.div>
                 )}
              </div>

              <div className="absolute bottom-4 right-4 z-10">
                 <div className="bg-[#030712]/80 backdrop-blur-xl px-4 py-3 border border-white/10 rounded-xl flex gap-6 shadow-2xl">
                    <MapLegend label="Optimal" color="#00ff9d" />
                    <MapLegend label="Busy" color="#ffc857" />
                    <MapLegend label="Congested" color="#ff4d4d" />
                 </div>
              </div>

              <div className="w-full h-full min-h-[500px]">
                 <CommandCenterMap isEmergency={isEmergency} />
              </div>
           </Card>

           {/* BOTTOM SECTION - ANALYTICS */}
           <div className="h-[240px] grid grid-cols-2 gap-6">
              <Card className="glass-card p-6 flex flex-col">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-primary" />
                        <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">Network Throughput</h3>
                    </div>
                    <span className="text-[10px] font-black text-success">+14.2%</span>
                 </div>
                 <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="time" hide />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', borderRadius: '8px' }}
                                itemStyle={{ color: '#00E5FF' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#00E5FF" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                 <MetricBox label="DELAY REDUCTION" value="28%" sub="AI Optimization" trend="up" color="success" />
                 <MetricBox label="ROUTE SCORE" value="98%" sub="Efficiency" trend="up" color="primary" />
                 <MetricBox label="CO₂ SAVED" value="4.2T" sub="Daily Impact" trend="up" color="primary" />
                 <MetricBox label="SIGNAL SYNC" value="18/18" sub="Node Health" trend="up" color="success" />
              </div>
           </div>
        </section>

        {/* RIGHT PANEL - WIRE FEED */}
        <aside className="space-y-6 flex flex-col h-full overflow-y-auto">
            
            <section className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">Intelligence Stream</h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                        <Activity size={10} className="text-primary animate-pulse" />
                        <span className="text-[8px] font-black text-primary uppercase">Live</span>
                    </div>
                </div>
                
                <Card className="glass-card flex-1 flex flex-col p-0 overflow-hidden bg-black/40">
                    <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                        <span className="text-[9px] font-black text-text-secondary tracking-widest uppercase">System Logs</span>
                    </div>
                    <div className="p-4 space-y-4 overflow-y-auto max-h-[450px] scrollbar-hide">
                        {events.map((event, i) => {
                          const eventText = event.event ?? event.message ?? "Realtime city event";
                          const eventLocation = event.location ?? event.type ?? "ZONE-4";
                          const eventTime = event.timestamp ?? event.created_at ?? "live";
                          const isEmergencyEvent = eventText.includes("Emergency") || eventText.includes("Corridor") || eventLocation.includes("emergency");
                          return (
                          <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-3 items-start group">
                            <div className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", isEmergencyEvent ? "bg-danger shadow-[0_0_8px_#ff4d4d]" : "bg-primary shadow-[0_0_8px_#00e5ff]")} />
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between">
                                <span className={cn(
                                  "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                                  isEmergencyEvent ? "bg-danger/20 text-danger" : "bg-primary/20 text-primary"
                                )}>{eventLocation}</span>
                                <span className="text-[8px] font-bold text-text-secondary/50">{eventTime}</span>
                              </div>
                              <p className="text-[11px] font-medium leading-tight text-white/80 group-hover:text-white transition-colors">
                                {eventText}
                              </p>
                            </div>
                          </motion.div>
                        )})}
                    </div>
                </Card>
            </section>

            <section className="space-y-4">
                <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">Priority Alerts</h3>
                <div className="space-y-3">
                   <div className="p-4 rounded-xl bg-warning/5 border border-warning/20 border-l-4 border-l-warning backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <CloudRain size={12} className="text-warning" />
                        <span className="text-[10px] font-black uppercase text-warning">Weather Update</span>
                      </div>
                      <p className="text-[11px] text-white/60 font-medium">Light rain Sector 7. Surface friction reduced. AI adjusting speeds.</p>
                   </div>

                   <div className="p-4 rounded-xl bg-danger/5 border border-danger/20 border-l-4 border-l-danger backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={12} className="text-danger" />
                        <span className="text-[10px] font-black uppercase text-danger">Obstruction</span>
                      </div>
                      <p className="text-[11px] text-white/60 font-medium">Main St East closed. Traffic redirected through spine road.</p>
                   </div>
                </div>
            </section>

        </aside>

      </div>

      <style jsx global>{`
        .glass-card {
            background: rgba(11, 17, 32, 0.4);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 1rem;
        }
        .premium-btn {
            display: flex;
            align-items: center;
            padding: 0.6rem 1.25rem;
            border-radius: 0.75rem;
            border: 1px solid;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-btn:hover {
            background: rgba(255, 255, 255, 0.07);
            transform: translateY(-1px);
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}</style>
    </div>
  );
}

function StatusSmall({ label, value, status }: { label: string, value: string, status: 'good' | 'warn' | 'crit' }) {
    const color = status === 'good' ? 'text-success' : status === 'warn' ? 'text-warning' : 'text-danger';
    return (
        <Card className="glass-card p-3 flex flex-col items-center justify-center text-center border-white/5">
            <span className="text-[8px] font-black text-text-secondary tracking-widest uppercase mb-1">{label}</span>
            <span className={cn("text-xs font-black", color)}>{value}</span>
        </Card>
    )
}

function StatusPill({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 shadow-[0_0_15px_rgba(0,255,157,0.1)]">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="whitespace-nowrap text-[9px] font-black uppercase tracking-tight text-success">{label}</span>
        </div>
    )
}

function MetricBox({ label, value, sub, color }: { label: string, value: string, sub: string, trend: 'up' | 'down', color: 'success' | 'primary' | 'danger' }) {
  const textColor = color === 'success' ? 'text-success' : color === 'primary' ? 'text-primary' : 'text-danger';
  const borderColor = color === 'success' ? 'border-success/20' : color === 'primary' ? 'border-primary/20' : 'border-danger/20';
  
  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card className={cn("glass-card p-5 flex flex-col justify-between h-full", borderColor)}>
        <span className="text-[9px] font-black text-text-secondary tracking-widest uppercase">{label}</span>
        <div className="my-1">
          <span className={cn("text-2xl font-black tracking-tighter", textColor)}>{value}</span>
        </div>
        <span className="text-[9px] font-bold text-text-secondary uppercase opacity-40">{sub}</span>
      </Card>
    </motion.div>
  )
}

function MapLegend({ label, color }: { label: string, color: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
            <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">{label}</span>
        </div>
    )
}
