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
        try {
        const resp = await triggerEmergencyCorridor("AMB-COMMAND", "City General");
        setCorridorStatusData(resp);
        } catch (e) {
            console.log("Emergency triggered (simulation mode)");
        }
    } else {
        setIsEmergency(false);
      setCorridorStatusData(null);
    }
  };

  return (
    <div className={cn(
      "flex flex-col gap-6 h-full transition-all duration-700",
      isEmergency && "emergency-mode-active"
    )}>
      
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

      <div className="grid grid-cols-1 xl:grid-cols-[20%_60%_20%] gap-6 flex-1">
        
        {/* LEFT PANEL - AI & STATUS */}
        <aside className="space-y-6 flex flex-col h-full overflow-y-auto">
          
          {/* AI INTELLIGENCE */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">AI Intelligence</h3>
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
                   <span className="text-primary font-[800]">92%</span>
                 </div>
               </div>
              </Card>
            </motion.div>

            <Card className="glow-card p-5 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 mb-3">
                    <Cpu size={14} className="text-primary" />
                    <span className="text-[10px] font-black tracking-widest text-primary uppercase">Suggested Action</span>
                </div>
                <p className="text-xs font-medium leading-relaxed">
                    Extend Signal Cycle <span className="text-primary font-bold">+12s</span> at Metro Junction to clear buildup.
                </p>
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
           <Card className="flex-1 glow-card relative overflow-hidden bg-black/40">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                 <div className="bg-secondary-background/80 backdrop-blur-md px-4 py-2 border border-border rounded flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-black tracking-widest uppercase">LIVE CITY OPERATIONS</span>
                 </div>
              </div>

              <div className="absolute bottom-4 right-4 z-10">
                 <div className="bg-secondary-background/80 backdrop-blur-md px-4 py-3 border border-border rounded-lg flex gap-6">
                    <MapLegend label="Green" color="#00FF88" />
                    <MapLegend label="Yellow" color="#FFC857" />
                    <MapLegend label="Red" color="#FF5252" />
                 </div>
              </div>

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
                 <MetricBox label="TIME SAVED" value="12.4m" sub="Total Today" trend="up" color="success" />
                 <MetricBox label="CO2 REDUCTION" value="4.2t" sub="Verified" trend="up" color="primary" />
                 <MetricBox label="AI DECISIONS" value="1,422" sub="Autopilot" trend="up" color="primary" />
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
                        {events.map((event, i) => (
                          <motion.div key={i} whileHover={{ scale: 1.02 }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex gap-3 items-start group">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shadow-neon shrink-0" />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-bold text-text-secondary">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                <span className={cn(
                                  "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                                  event.event.includes("Emergency") ? "bg-danger/20 text-danger" : "bg-primary/20 text-primary"
                                )}>{event.location || "ZONE-4"}</span>
                              </div>
                              <p className="text-[11px] font-medium leading-tight group-hover:text-primary transition-colors cursor-default">
                                {event.event}
                              </p>
                            </div>
                          </motion.div>
                        ))}
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

function MetricBox({ label, value, sub, color }: { label: string, value: string, sub: string, trend: 'up' | 'down', color: 'success' | 'primary' | 'danger' }) {
  const textColor = color === 'success' ? 'text-success' : color === 'primary' ? 'text-primary' : 'text-danger';
  return (
    <motion.div whileHover={{ y: -6 }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <Card className="glow-card p-4 flex flex-col justify-between">
        <span className="text-[9px] font-black text-text-secondary tracking-widest uppercase">{label}</span>
        <div className="my-1">
          <span className={cn("text-2xl font-black", textColor)}>{value}</span>
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
