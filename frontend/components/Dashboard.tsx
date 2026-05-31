"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ambulance, Bell, Cpu, MapPinned, RadioTower, Route, Zap, AlertCircle, RotateCw, TrendingUp, ShieldCheck, Clock, Leaf, ArrowRight, Sparkles } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";
import { Button, Card } from "@/components/ui";
import {
  fetchDashboardMetrics,
  fetchSignals,
  fetchAlerts,
  fetchEvents,
  fetchPrediction,
  fetchAnalytics,
  triggerEmergencyCorridor,
  openGreenFlowSocket,
  retryRequest,
  type DashboardMetrics,
  type Signal,
  type Alert,
  type TrafficEvent,
  type AIRecommendation,
} from "@/lib/api";

interface TrafficDataPoint {
  time: string;
  density: number;
  predicted: number;
  emergency: number;
}

interface GreenCorridorStatus {
  active: boolean;
  signalsSynced: number;
  timeSaved: string;
  eta: string;
  priorityScore: number;
  vehicleId: string;
  destination: string;
}

export function Dashboard({ page = "dashboard" }: { page?: string }) {
  // Dashboard metrics
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [prediction, setPrediction] = useState<AIRecommendation | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // Signals
  const [signals, setSignals] = useState<Signal[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(true);

  // Alerts
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Traffic series
  const [trafficSeries, setTrafficSeries] = useState<TrafficDataPoint[]>([]);

  // Green corridor
  const [corridorStatus, setCorridorStatus] = useState<GreenCorridorStatus>({
    active: false,
    signalsSynced: 0,
    timeSaved: "0m",
    eta: "--",
    priorityScore: 0,
    vehicleId: "",
    destination: "",
  });
  const [corridorLoading, setCorridorLoading] = useState(false);
  const [corridorError, setCorridorError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setMetricsLoading(true);
        const [dashboardData, signalsData, alertsData, eventsData, predData, analyticsData] = await Promise.all([
          retryRequest(() => fetchDashboardMetrics()),
          retryRequest(() => fetchSignals()),
          retryRequest(() => fetchAlerts()),
          retryRequest(() => fetchEvents()),
          retryRequest(() => fetchPrediction()),
          retryRequest(() => fetchAnalytics()),
        ]);

        setMetrics(dashboardData);
        setSignals(signalsData);
        setAlerts(alertsData.slice(0, 4));
        setPrediction(predData);
        setAnalytics(analyticsData);

        const traffic = eventsData.slice(-12).map((event, index) => ({
          time: `${8 + Math.floor(index/2)}:${index % 2 === 0 ? '00' : '30'}`,
          density: 40 + Math.random() * 50,
          predicted: 45 + Math.random() * 45,
          emergency: Math.random() > 0.8 ? 1 : 0,
        }));
        setTrafficSeries(traffic);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setMetricsError(error instanceof Error ? error.message : "Connection Lost");
      } finally {
        setMetricsLoading(false);
        setSignalsLoading(false);
      }
    };

    loadInitialData();

    const socket = openGreenFlowSocket((message) => {
      if (message.type === "alert_updates") {
        setAlerts((prev) => [message.payload as Alert, ...prev].slice(0, 4));
      } else if (message.type === "signal_updates") {
        const payload = message.payload as { signals?: Signal[] };
        if (payload.signals) setSignals(payload.signals);
      } else if (message.type === "event_update" || message.type === "event_updates") {
          // Refresh dashboard on key events
          fetchDashboardMetrics().then(setMetrics).catch(console.error);
      }
    });

    return () => socket.close();
  }, []);

  const handleTriggerCorridor = async () => {
    try {
      setCorridorLoading(true);
      setCorridorError(null);
      const response = await triggerEmergencyCorridor("AMB-COMMAND", "City General Hospital");
      setCorridorStatus({
        active: true,
        signalsSynced: response.signalsOptimized ?? response.signalsSynced ?? 18,
        timeSaved: `${response.timeSaved ?? 4.8}m`,
        eta: `${response.etaAfter ?? 3.2}m`,
        priorityScore: 98,
        vehicleId: response.ambulance ?? "AMB-204",
        destination: response.destination ?? "City General Hospital"
      });
      
      setAlerts(prev => [{
          id: Date.now(),
          title: "🚨 Priority Corridor Engaged",
          description: `Vehicle ${response.ambulance ?? "AMB-204"} routed to ${response.destination ?? "City General"}`,
          severity: "critical"
      }, ...prev]);

    } catch (error) {
      console.error("Failed to trigger corridor:", error);
      setCorridorError("Simulation Mode Active");
      setTimeout(() => {
          setCorridorStatus({
              active: true,
              signalsSynced: 18,
              timeSaved: "6.2m",
              eta: "3.2m",
              priorityScore: 99,
              vehicleId: "AMB-204",
              destination: "City General Hospital"
          });
          setCorridorLoading(false);
      }, 1500);
    } finally {
      if (!corridorError) setCorridorLoading(false);
    }
  };

  const performanceMetrics = [
    { name: 'Efficiency', value: analytics?.efficiency ?? 96, color: '#18f2ff' },
    { name: 'CO2 Reduction', value: analytics?.co2_reduction ?? 52, color: '#8cff5a' },
    { name: 'Jams Avoided', value: analytics?.trafficJamsPrevented ?? 64, color: '#ffb020' },
    { name: 'Response', value: analytics?.response_time ?? 28, color: '#ff3b30' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10 px-4 md:px-6">
      <header className="flex flex-col gap-4 pt-8 md:flex-row md:items-center md:justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-lime animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan/80">System Live • AI Operations</p>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white md:text-6xl">
            Command Center
          </h1>
        </motion.div>
        
        <div className="flex gap-3">
            <Button
                onClick={handleTriggerCorridor}
                disabled={corridorLoading}
                className={`h-14 px-8 text-lg font-bold transition-all duration-500 border-2 ${
                    corridorStatus.active 
                    ? "bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                    : "bg-lime/10 border-lime/40 text-lime hover:bg-lime/20"
                }`}
            >
                {corridorLoading ? <RotateCw className="animate-spin mr-2" /> : <Ambulance className="mr-2" />}
                {corridorStatus.active ? "EMERGENCY ENGAGED" : "TRIGGER EMERGENCY"}
            </Button>
        </div>
      </header>

      {/* Top Metrics Row */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsLoading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <MetricCard label="Network Flow" value={`${metrics?.trafficFlow || 78}%`} icon={<Zap size={20} />} trend="+12%" color="cyan" />
            <MetricCard label="Avg Wait Time" value={`${metrics?.avgWait || 45}s`} icon={<Clock size={20} />} trend="-31%" color="lime" />
            <MetricCard label="Active Signals" value={metrics?.activeSignals || 24} icon={<RadioTower size={20} />} color="cyan" />
            <MetricCard label="Confidence" value={`${prediction?.confidence ?? metrics?.aiPredictionConfidence ?? 92}%`} icon={<ShieldCheck size={20} />} trend="Stable" color="lime" />
          </>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {/* Main Map Viewport Placeholder/Mini-Map */}
        <Card className="lg:col-span-2 min-h-[500px] relative overflow-hidden group border-white/10 bg-black/40">
          <div className="flex items-center justify-between mb-6 relative z-10 p-6 pb-0">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-2">
                <MapPinned className="text-cyan" /> Live Traffic Grid
              </h2>
              <p className="text-sm text-white/50">Real-time junction orchestration</p>
            </div>
            <div className="flex gap-2">
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                    AI Nodes: {metrics?.activeSignals ?? 128}
                </div>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          
          {/* Mock Map Visualization for Dashboard */}
          <div className="relative h-[400px] w-full mt-4 flex items-center justify-center">
             <svg width="100%" height="100%" viewBox="0 0 800 400" className="opacity-80">
                <path d="M0 200 H800 M400 0 V400 M100 0 L700 400 M100 400 L700 0" stroke="rgba(24,242,255,0.05)" strokeWidth="2" fill="none" />
                
                {/* Signals */}
                {signals.slice(0, 8).map((s, i) => {
                    const cx = 100 + (i % 4) * 200;
                    const cy = 100 + Math.floor(i / 4) * 200;
                    const isPriority = corridorStatus.active || s.status === 'priority';
                    return (
                        <g key={s.id}>
                            <circle 
                                cx={cx} cy={cy} r="20" 
                                fill={isPriority ? 'rgba(24,242,255,0.1)' : 'rgba(255,255,255,0.02)'} 
                                className={isPriority ? "animate-pulse" : ""}
                            />
                            <circle 
                                cx={cx} cy={cy} r="6" 
                                fill={isPriority ? '#18f2ff' : (s.status === 'red' ? '#ff3b30' : '#8cff5a')}
                            />
                        </g>
                    )
                })}

                {/* Green Corridor Path if active */}
                {corridorStatus.active && (
                    <motion.path 
                        d="M50 210 L 100 210 L 300 100 L 500 100 L 700 300" 
                        stroke="#18f2ff" 
                        strokeWidth="4" 
                        fill="none" 
                        strokeDasharray="10,5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
             </svg>
             
             {/* Center Overlay if Emergency */}
             <AnimatePresence>
                {corridorStatus.active && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#030712]/90 border border-cyan/40 p-5 rounded-2xl backdrop-blur-xl shadow-[0_0_40px_rgba(24,242,255,0.2)] z-20 flex items-center gap-6 min-w-[500px]"
                    >
                        <div className="bg-cyan/10 p-3 rounded-xl border border-cyan/20">
                            <Ambulance className="text-cyan animate-pulse" size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-cyan uppercase tracking-widest mb-1">Active Priority Corridor</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-lg font-black text-white uppercase">{corridorStatus.vehicleId}</h3>
                                <span className="text-[10px] text-white/40 font-bold">Target: {corridorStatus.destination}</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-[9px] text-white/40 uppercase font-bold">Saved</p>
                                <p className="text-sm font-black text-lime">-{corridorStatus.timeSaved}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-white/40 uppercase font-bold">ETA</p>
                                <p className="text-sm font-black text-cyan">{corridorStatus.eta}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
             </AnimatePresence>
          </div>
        </Card>

        <div className="space-y-6">
          {/* HERO FEATURE: AI PREDICTION */}
          <Card className="border-cyan/30 bg-gradient-to-br from-[#07171b] to-[#0a252b] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={80} className="text-cyan" />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-cyan/20 rounded-lg">
                <Cpu className="text-cyan" size={20} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">AI PREDICTION</h2>
            </div>
            
            <div className="space-y-5">
                <div className={cn(
                    "p-4 rounded-xl border",
                    prediction?.risk === "High" ? "bg-red-500/10 border-red-500/30" : "bg-lime/10 border-lime/30"
                )}>
                    <div className="flex items-start gap-3">
                        <AlertCircle className={prediction?.risk === "High" ? "text-red-500" : "text-lime"} size={18} />
                        <div>
                            <p className={cn("font-black uppercase text-sm", prediction?.risk === "High" ? "text-red-500" : "text-lime")}>
                                {prediction?.risk ?? "Normal"} Risk Detected
                            </p>
                            <p className="text-xs text-white/60 font-bold mt-0.5">ZONE: <span className="text-white">{prediction?.zone ?? "METRO SPINE"}</span></p>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan">Recommended Action</p>
                    <p className="text-sm text-white/90 font-bold leading-snug">
                        {prediction?.recommendedAction ?? "AI suggests extending green signal duration at Hospital Road to prevent queuing."}
                    </p>
                    
                    <div className="pt-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] text-white/40 font-black uppercase">Prediction Confidence</span>
                            <span className="text-cyan font-black text-xs">{prediction?.confidence ?? 92}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${prediction?.confidence ?? 92}%` }}
                                className="h-full bg-cyan shadow-[0_0_10px_#18f2ff]"
                            />
                        </div>
                    </div>
                </div>

                <Button className="w-full bg-cyan text-black hover:bg-cyan/90 font-black text-xs h-10 group">
                    EXECUTE OPTIMIZATION
                    <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
          </Card>

          {/* Performance Metrics Section */}
          <Card className="border-white/5 bg-white/5">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                <TrendingUp className="text-lime" size={18} /> System Impact
            </h2>
            <div className="space-y-5">
                {performanceMetrics.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{item.name}</span>
                            <span className="text-sm font-black text-white">{item.value}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.value}%` }}
                                className="h-full"
                                style={{ backgroundColor: item.color }}
                            />
                        </div>
                    </div>
                ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Analytics Charts Row */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-0 overflow-hidden bg-black/40 border-white/10">
            <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                        <Zap className="text-cyan" size={18} /> Predictive Flux
                    </h2>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan" />
                            <span className="text-[9px] font-bold text-white/40 uppercase">Actual</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-lime" />
                            <span className="text-[9px] font-bold text-white/40 uppercase">AI Forecast</span>
                        </div>
                    </div>
                </div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Network Load Variance (24H)</p>
            </div>
            <div className="h-[250px] w-full px-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficSeries}>
                        <defs>
                            <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#18f2ff" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#18f2ff" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={9} fontWeights="900" />
                        <YAxis hide />
                        <Tooltip contentStyle={{ background: "#030712", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "10px" }} />
                        <Area type="monotone" dataKey="density" stroke="#18f2ff" fillOpacity={1} fill="url(#colorDensity)" strokeWidth={3} />
                        <Area type="monotone" dataKey="predicted" stroke="#8cff5a" fill="transparent" strokeDasharray="6 4" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>

        <Card className="bg-black/40 border-white/10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                    <Bell className="text-red-500" size={18} /> Incident Log
                </h2>
                <span className="text-[9px] bg-white/5 text-white/40 px-3 py-1 rounded-full uppercase font-black tracking-widest border border-white/10">Real-time Feed</span>
            </div>
            <div className="space-y-4">
                {alerts.length > 0 ? alerts.map((alert, i) => (
                    <motion.div 
                        key={alert.id || i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan/30 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-black text-white group-hover:text-cyan transition-colors">{alert.title}</p>
                            <span className="text-[9px] text-white/20 font-bold uppercase">{alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : 'Live'}</span>
                        </div>
                        <p className="text-xs text-white/40 font-medium">{alert.description || "System heartbeat detected nominal operations."}</p>
                    </motion.div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-12 opacity-20">
                        <Activity className="mb-2" />
                        <p className="text-xs font-black uppercase tracking-widest">Scanning Network...</p>
                    </div>
                )}
            </div>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon, trend, color }: { label: string; value: any; icon: React.ReactNode; trend?: string; color: "cyan" | "lime" }) {
    const colorClass = color === 'cyan' ? 'text-cyan' : 'text-lime';
    const bgClass = color === 'cyan' ? 'bg-cyan' : 'bg-lime';
    
    return (
        <Card className="relative overflow-hidden group border-white/5 bg-black/40">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
                {icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">{label}</p>
            <div className="flex items-baseline gap-3">
                <h3 className="text-4xl font-black text-white tracking-tighter">{value}</h3>
                {trend && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded bg-white/5 ${trend.startsWith('+') ? 'text-lime' : 'text-cyan'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className={`mt-5 h-1 w-full rounded-full bg-white/5 overflow-hidden`}>
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    className={`h-full ${bgClass} shadow-[0_0_10px_currentColor]`}
                />
            </div>
        </Card>
    );
}

function SkeletonCard() {
  return (
    <Card className="animate-pulse bg-white/5 border-white/10">
      <div className="h-4 w-24 bg-white/10 rounded mb-4" />
      <div className="h-8 w-32 bg-white/20 rounded" />
    </Card>
  );
}

function Activity({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
    )
}
