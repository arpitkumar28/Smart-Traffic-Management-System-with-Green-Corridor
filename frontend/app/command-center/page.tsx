"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  BarChart3, 
  Cpu, 
  Activity, 
  Zap, 
  Ambulance,
  BrainCircuit,
  Terminal,
  Sparkles,
  ArrowRight,
  CloudRain,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Target
} from "lucide-react";

import { Card, cn } from "../../components/ui";
import { CommandCenterMap } from "../../components/command-center/CommandCenterMap";
import { 
  fetchDashboardMetrics, 
  fetchAlerts, 
  fetchEvents, 
  fetchPrediction,
  fetchAnalytics,
  triggerEmergencyCorridor,
  openGreenFlowSocket,
  retryRequest, 
  type DashboardMetrics, 
  type Alert, 
  type TrafficEvent,
  type GreenCorridorResponse,
  type AIRecommendation
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

const chartData = [
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
  const [prediction, setPrediction] = useState<AIRecommendation | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isApplyingAi, setIsApplyingAi] = useState(false);
  const [aiApplied, setAiApplied] = useState(false);
  const [corridorStatusData, setCorridorStatusData] = useState<GreenCorridorResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashData, alertsData, eventsData, predData, analyticsData] = await Promise.all([
          retryRequest(() => fetchDashboardMetrics()),
          retryRequest(() => fetchAlerts()),
          retryRequest(() => fetchEvents()),
          retryRequest(() => fetchPrediction()),
          retryRequest(() => fetchAnalytics())
        ]);
        setMetrics(dashData);
        setEvents(eventsData.slice(0, 10));
        setPrediction(predData);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    const socket = openGreenFlowSocket((message) => {
        if (message.type === "GREEN_CORRIDOR_ACTIVATED") {
            setIsEmergency(true);
            setCorridorStatusData(message.payload);
        } else if (message.type === "event_update" || message.type === "event_updates") {
            const event = message.payload.event ?? message.payload;
            setEvents(prev => [event, ...prev].slice(0, 10));
        }
    });

    const interval = setInterval(loadData, 15000);
    return () => {
        clearInterval(interval);
        socket.close();
    };
  }, []);

  const toggleEmergency = async () => {
    if (!isEmergency) {
        try {
            const resp = await triggerEmergencyCorridor("AMB-COMMAND", "City General Hospital");
            setIsEmergency(true);
            setCorridorStatusData(resp);
        } catch (e) {
            setIsEmergency(true);
            setCorridorStatusData({
              status: "Green Corridor Activated",
              type: "green_corridor",
              ambulance: "A-204",
              vehicleId: "A-204",
              destination: "City General Hospital",
              etaBefore: 8,
              etaAfter: 4,
              timeSaved: 4.2,
              signalsOptimized: 18,
              signalsSynced: 18,
              route: ["SIG-01", "SIG-02"],
            });
        }
    } else {
        setIsEmergency(false);
        setCorridorStatusData(null);
    }
  };

  const handleApplyAi = () => {
      setIsApplyingAi(true);
      setTimeout(() => {
          setIsApplyingAi(false);
          setAiApplied(true);
          setTimeout(() => setAiApplied(false), 3000);
      }, 1500);
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
            <h1 className="mt-2 text-4xl xl:text-6xl font-black tracking-tighter text-white uppercase italic tracking-tight">GreenFlow <span className="text-primary italic">AI</span></h1>
          </div>
          <div className="flex flex-wrap gap-3 justify-end max-w-2xl">
            <StatusPill label="SYSTEM ONLINE" />
            <StatusPill label="AI ENGINE ACTIVE" />
            <StatusPill label="SIGNAL SYNC" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-2xl">
          <button onClick={toggleEmergency} className={cn(
            "premium-btn flex-1 md:flex-none justify-center h-14",
            isEmergency 
              ? "border-danger text-danger bg-danger/10 shadow-[0_0_25px_rgba(255,77,77,0.3)] animate-pulse" 
              : "border-primary/40 text-primary hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]"
          )}>
            <Ambulance size={18} className="mr-3" />
            <span className="text-sm font-black tracking-widest uppercase">{isEmergency ? "TERMINATE EMERGENCY" : "TRIGGER EMERGENCY DEMO"}</span>
          </button>
          
          <div className="hidden lg:flex items-center gap-2 ml-auto px-4 py-2 bg-white/5 rounded-lg border border-white/5">
             <Terminal size={12} className="text-primary/60" />
             <span className="text-[10px] font-bold text-text-secondary tracking-tight uppercase">MISSION CRITICAL INFRASTRUCTURE ACCESS</span>
          </div>
        </div>
      </header>
      
      <AnimatePresence>
        {isEmergency && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-danger/20 border-y border-danger/30 h-10 w-full flex items-center justify-center overflow-hidden">
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="text-danger font-black text-xs tracking-[0.5em] uppercase">🚨 PRIORITY EMERGENCY CORRIDOR ENGAGED 🚨</motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-[25%_50%_25%] gap-6 flex-1">
        
        {/* LEFT PANEL - AI DECISION ENGINE (Priority 2) */}
        <aside className="space-y-6 flex flex-col h-full overflow-y-auto">
          <section className="space-y-4">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase flex items-center gap-2">
                <BrainCircuit size={12} className="text-primary" />
                AI Decision Engine
            </h3>
            
            <motion.div whileHover={{ y: -4 }}>
              <Card className="glass-card p-6 space-y-5 border-primary/30 bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><Sparkles size={60} className="text-primary" /></div>
                
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Active Intelligence</span>
                    <div className="px-2 py-0.5 rounded bg-primary text-black text-[8px] font-black italic">OPTIMIZING</div>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Zone</p>
                            <p className="text-sm font-black text-white uppercase truncate">{prediction?.zone ?? "Civic Center"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Confidence</p>
                            <p className="text-sm font-black text-primary">{prediction?.confidence ?? 92}%</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Current Traffic</p>
                            <p className="text-xs font-black text-amber-400 uppercase">Moderate</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Predicted (15m)</p>
                            <p className="text-xs font-black text-red-500 uppercase">Heavy</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Recommended Action</p>
                        <p className="text-xs font-bold text-white leading-relaxed mb-4">
                            {prediction?.recommendedAction ?? "Extend Signal Cycle +12s"}
                        </p>
                        
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] text-text-secondary font-black uppercase">Expected Improvement</span>
                            <span className="text-success font-black text-sm">+24% Flow</span>
                        </div>

                        <button 
                            onClick={handleApplyAi}
                            disabled={isApplyingAi || aiApplied}
                            className={cn(
                                "w-full py-3 rounded-lg flex items-center justify-center gap-2 group transition-all border font-black uppercase text-[10px] tracking-[0.1em]",
                                aiApplied ? "bg-success/20 border-success/30 text-success" : "bg-primary/20 border-primary/40 text-primary hover:bg-primary/30"
                            )}
                        >
                            {isApplyingAi ? <Activity size={12} className="animate-spin" /> : aiApplied ? <CheckCircle2 size={12} /> : <Zap size={12} />}
                            {aiApplied ? "Action Applied" : "Execute AI Command"}
                        </button>
                    </div>
                </div>
              </Card>
            </motion.div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">Network Performance</h3>
            <div className="grid grid-cols-2 gap-3">
                <StatusSmall label="EFFICIENCY" value={`${analytics?.efficiency ?? 96}%`} status="good" />
                <StatusSmall label="RESPONSE" value={`${analytics?.response_time ?? 28}s`} status="good" />
                <StatusSmall label="CO₂ SAVED" value={`${analytics?.co2_reduction ?? 52}%`} status="good" />
                <StatusSmall label="FLOW" value={`${metrics?.trafficFlow ?? 90}%`} status="good" />
            </div>
          </section>
        </aside>

        {/* CENTER PANEL - LIVE GRID MAP (Priority 3) */}
        <section className="flex flex-col gap-6 h-full">
           <Card className="flex-1 glass-card relative overflow-hidden bg-black min-h-[560px] border-white/10">
              <div className="absolute top-4 left-4 z-10 space-y-2">
                 <div className="bg-[#030712]/80 backdrop-blur-xl px-4 py-2 border border-white/10 rounded-lg flex items-center gap-3 shadow-2xl">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_10px_#00ff9d]" />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">LIVE SATELLITE FEED</span>
                 </div>
                 
                 {isEmergency && (
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-danger/90 backdrop-blur-xl px-5 py-4 border border-danger/50 rounded-xl shadow-2xl min-w-[200px]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white mb-2">Priority Routing Active</p>
                        <div className="flex items-center gap-6">
                            <div><p className="text-[8px] text-white/50 uppercase font-black">Ambulance</p><p className="text-lg font-black text-white">{corridorStatusData?.ambulance ?? "AMB-204"}</p></div>
                            <div className="w-[1px] h-8 bg-white/20" />
                            <div><p className="text-[8px] text-white/50 uppercase font-black">Target ETA</p><p className="text-lg font-black text-success">{corridorStatusData?.etaAfter ?? "3.2"}m</p></div>
                        </div>
                    </motion.div>
                 )}
              </div>

              <div className="w-full h-full min-h-[500px]">
                 <CommandCenterMap isEmergency={isEmergency} routeCoords={corridorStatusData?.route_coords} />
              </div>
           </Card>

           {/* BOTTOM SECTION - ANALYTICS (Priority 4) */}
           <div className="h-[240px] grid grid-cols-2 gap-6">
              <Card className="glass-card p-6 flex flex-col">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><BarChart3 size={14} className="text-primary" /><h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">Grid Throughput</h3></div>
                    <span className="text-[10px] font-black text-success">+{analytics?.efficiency ?? 14}%</span>
                 </div>
                 <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs><linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/><stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', borderRadius: '8px' }} itemStyle={{ color: '#00E5FF' }} />
                            <Area type="monotone" dataKey="value" stroke="#00E5FF" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                 <MetricBox label="Efficiency" value={`${analytics?.efficiency ?? 96}%`} sub="AI Flow Rate" color="success" icon={<Zap />} />
                 <MetricBox label="Response Time" value={`${analytics?.response_time ?? 28}s`} sub="Avg Crisis" color="primary" icon={<Activity />} />
                 <MetricBox label="Hours Saved" value={analytics?.hoursSaved?.toString() ?? "46"} sub="Weekly Total" color="primary" icon={<TrendingUp />} />
                 <MetricBox label="Jams Prevented" value={analytics?.trafficJamsPrevented?.toString() ?? "64"} sub="AI Mitigation" color="success" icon={<ShieldCheck />} />
              </div>
           </div>
        </section>

        {/* RIGHT PANEL - LIVE LOGS */}
        <aside className="space-y-6 flex flex-col h-full overflow-y-auto">
            <section className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary uppercase">Operational Logs</h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20"><Activity size={10} className="text-primary animate-pulse" /><span className="text-[8px] font-black text-primary uppercase">Live</span></div>
                </div>
                
                <Card className="glass-card flex-1 flex flex-col p-0 overflow-hidden bg-black/40">
                    <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between"><span className="text-[9px] font-black text-text-secondary tracking-widest uppercase">System Events</span></div>
                    <div className="p-4 space-y-4 overflow-y-auto max-h-[550px] scrollbar-hide">
                        {events.map((event, i) => {
                          const eventText = event.event ?? event.message ?? "System heartbeat";
                          const eventLocation = event.location ?? event.type ?? "ZONE-4";
                          const isEmergencyEvent = eventText.includes("Emergency") || eventText.includes("Corridor") || eventLocation.includes("emergency");
                          return (
                          <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-3 items-start group">
                            <div className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", isEmergencyEvent ? "bg-danger shadow-[0_0_8px_#ff4d4d]" : "bg-primary shadow-[0_0_8px_#00e5ff]")} />
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between">
                                <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded uppercase", isEmergencyEvent ? "bg-danger/20 text-danger" : "bg-primary/20 text-primary")}>{eventLocation}</span>
                                <span className="text-[8px] font-bold text-text-secondary/50">{event.timestamp ?? "Now"}</span>
                              </div>
                              <p className="text-[11px] font-bold leading-tight text-white/80">{eventText}</p>
                            </div>
                          </motion.div>
                        )})}
                    </div>
                </Card>
            </section>
        </aside>
      </div>

      <style jsx global>{`
        .glass-card { background: rgba(11, 17, 32, 0.4); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; }
        .premium-btn { display: flex; align-items: center; padding: 0.6rem 1.25rem; border-radius: 0.75rem; border: 1px solid; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); font-size: 10px; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .premium-btn:hover { background: rgba(255, 255, 255, 0.07); transform: translateY(-1px); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

function StatusSmall({ label, value, status }: { label: string, value: string, status: 'good' | 'warn' | 'crit' }) {
    const color = status === 'good' ? 'text-success' : status === 'warn' ? 'text-warning' : 'text-danger';
    return (
        <Card className="glass-card p-4 flex flex-col items-center justify-center text-center border-white/5">
            <span className="text-[9px] font-black text-text-secondary tracking-widest uppercase mb-1">{label}</span>
            <span className={cn("text-lg font-black", color)}>{value}</span>
        </Card>
    )
}

function StatusPill({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 shadow-[0_0_15_rgba(0,255,157,0.1)]">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="whitespace-nowrap text-[9px] font-black uppercase tracking-tight text-success">{label}</span>
        </div>
    )
}

function MetricBox({ label, value, sub, color, icon }: { label: string, value: string, sub: string, color: 'success' | 'primary', icon: React.ReactNode }) {
  const textColor = color === 'success' ? 'text-success' : 'text-primary';
  const borderColor = color === 'success' ? 'border-success/20' : 'border-primary/20';
  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card className={cn("glass-card p-6 flex flex-col justify-between h-full relative group", borderColor)}>
        <div className={cn("absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity", textColor)}>
            {icon}
        </div>
        <span className="text-[9px] font-black text-text-secondary tracking-widest uppercase">{label}</span>
        <div className="my-1"><span className={cn("text-4xl font-black tracking-tighter", textColor)}>{value}</span></div>
        <span className="text-[9px] font-bold text-text-secondary uppercase opacity-40">{sub}</span>
      </Card>
    </motion.div>
  )
}
