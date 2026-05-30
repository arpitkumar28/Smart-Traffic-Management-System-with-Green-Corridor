"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ambulance, Bell, Cpu, MapPinned, RadioTower, Route, Zap, AlertCircle, RotateCw, TrendingUp, ShieldCheck, Clock, Leaf } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";
import { Button, Card } from "@/components/ui";
import {
  fetchDashboardMetrics,
  fetchSignals,
  fetchAlerts,
  fetchEvents,
  triggerEmergencyCorridor,
  openGreenFlowSocket,
  retryRequest,
  type DashboardMetrics,
  type Signal,
  type Alert,
  type TrafficEvent,
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
}

export function Dashboard({ page = "dashboard" }: { page?: string }) {
  // Dashboard metrics
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
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
  });
  const [corridorLoading, setCorridorLoading] = useState(false);
  const [corridorError, setCorridorError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setMetricsLoading(true);
        const [dashboardData, signalsData, alertsData, eventsData] = await Promise.all([
          retryRequest(() => fetchDashboardMetrics()),
          retryRequest(() => fetchSignals()),
          retryRequest(() => fetchAlerts()),
          retryRequest(() => fetchEvents()),
        ]);

        setMetrics(dashboardData);
        setSignals(signalsData);
        setAlerts(alertsData.slice(0, 4));

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
      } else if (message.type === "GREEN_CORRIDOR_ACTIVATED") {
          setCorridorStatus({
              active: true,
              signalsSynced: message.payload.signalsOptimized || 5,
              timeSaved: `${message.payload.timeSaved || 6}m`,
              eta: `${message.payload.etaAfter || 8}m`,
              priorityScore: 99,
              vehicleId: message.payload.vehicleId || "AMB-911"
          });
      }
    });

    return () => socket.close();
  }, []);

  const handleTriggerCorridor = async () => {
    try {
      setCorridorLoading(true);
      setCorridorError(null);
      const response = await triggerEmergencyCorridor("AMB-102", "City Hospital");
      setCorridorStatus({
        active: true,
        signalsSynced: response.signalsOptimized ?? 6,
        timeSaved: `${response.timeSaved ?? 4}m`,
        eta: `${response.etaAfter ?? 12}m`,
        priorityScore: 98,
        vehicleId: response.vehicleId ?? "AMB-102"
      });
      
      // Temporary success alert
      setAlerts(prev => [{
          id: Date.now(),
          title: "🚨 Green Corridor Activated for AMB-102",
          description: "Route cleared to City Hospital",
          severity: "high"
      }, ...prev]);

    } catch (error) {
      setCorridorError("Manual Bypass: Triggering simulation...");
      // Simulation for demo
      setTimeout(() => {
          setCorridorStatus({
              active: true,
              signalsSynced: 5,
              timeSaved: "7m",
              eta: "9m",
              priorityScore: 99,
              vehicleId: "AMB-DEMO"
          });
          setCorridorLoading(false);
      }, 1500);
    } finally {
      if (!corridorError) setCorridorLoading(false);
    }
  };

  const analyticsData = [
    { name: 'Traffic Vol', value: 85, color: '#18f2ff' },
    { name: 'Wait Time', value: 42, color: '#ffb020' },
    { name: 'CO2 Saved', value: 68, color: '#8cff5a' },
    { name: 'Resp Time', value: 92, color: '#ff3b30' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10 px-4 md:px-6">
      <header className="flex flex-col gap-4 pt-8 md:flex-row md:items-center md:justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-lime animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan/80">System Live • New Delhi Zone</p>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white md:text-6xl">
            Command Center
          </h1>
        </motion.div>
        
        <div className="flex gap-3">
            <Button
                onClick={handleTriggerCorridor}
                disabled={corridorLoading}
                className={`h-14 px-8 text-lg font-bold transition-all duration-500 ${
                    corridorStatus.active 
                    ? "bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                    : "bg-lime/10 border-lime/40 text-lime hover:bg-lime/20"
                }`}
            >
                {corridorLoading ? <RotateCw className="animate-spin mr-2" /> : <Ambulance className="mr-2" />}
                {corridorStatus.active ? "Emergency Active" : "Trigger Green Corridor"}
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
            <MetricCard label="CO2 Reduction" value="2.8t" icon={<Leaf size={20} />} trend="+18%" color="lime" />
          </>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {/* Main Map Viewport Placeholder/Mini-Map */}
        <Card className="lg:col-span-2 min-h-[500px] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-2">
                <MapPinned className="text-cyan" /> Live Traffic Grid
              </h2>
              <p className="text-sm text-white/50">Real-time junction orchestration</p>
            </div>
            <div className="flex gap-2">
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                    60 FPS Stream
                </div>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-[#07171b] map-grid opacity-40" />
          
          {/* Mock Map Visualization for Dashboard */}
          <div className="relative h-[400px] w-full mt-4 flex items-center justify-center">
             <svg width="100%" height="100%" viewBox="0 0 800 400" className="opacity-80">
                <path d="M0 200 H800 M400 0 V400 M100 0 L700 400 M100 400 L700 0" stroke="rgba(24,242,255,0.1)" strokeWidth="4" fill="none" />
                
                {/* Signals */}
                {signals.slice(0, 6).map((s, i) => (
                    <circle 
                        key={s.id} 
                        cx={200 + (i % 3) * 200} 
                        cy={100 + Math.floor(i / 3) * 200} 
                        r="12" 
                        fill={s.status === 'priority' ? '#18f2ff' : (s.status === 'red' ? '#ff3b30' : '#8cff5a')}
                        className={s.status === 'priority' ? "animate-pulse" : ""}
                    />
                ))}

                {/* Green Corridor Path if active */}
                {corridorStatus.active && (
                    <motion.path 
                        d="M50 210 Q 400 210, 750 100" 
                        stroke="#18f2ff" 
                        strokeWidth="8" 
                        fill="none" 
                        strokeDasharray="20,10"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                    />
                )}
             </svg>
             
             {/* Center Overlay if Emergency */}
             <AnimatePresence>
                {corridorStatus.active && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#07171b]/90 border-2 border-cyan p-6 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(24,242,255,0.3)] z-20 text-center min-w-[300px]"
                    >
                        <div className="bg-cyan/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan/40">
                            <Ambulance className="text-cyan" size={32} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-1">EMERGENCY ACTIVE</h3>
                        <p className="text-cyan font-mono text-sm mb-4">{corridorStatus.vehicleId} • Route Cleared</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-2 rounded-lg">
                                <p className="text-[10px] text-white/50 uppercase">Time Saved</p>
                                <p className="text-lg font-black text-lime">{corridorStatus.timeSaved}</p>
                            </div>
                            <div className="bg-white/5 p-2 rounded-lg">
                                <p className="text-[10px] text-white/50 uppercase">New ETA</p>
                                <p className="text-lg font-black text-cyan">{corridorStatus.eta}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
             </AnimatePresence>
          </div>
        </Card>

        <div className="space-y-6">
          {/* AI PREDICTION CARD */}
          <Card className="border-cyan/30 bg-gradient-to-br from-[#07171b] to-[#0a252b]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-cyan/20 rounded-lg">
                <Cpu className="text-cyan" size={20} />
              </div>
              <h2 className="text-xl font-bold">AI Traffic Predictor</h2>
            </div>
            
            <div className="space-y-4">
                <div className="p-4 rounded-xl bg-ember/10 border border-ember/20">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-ember mt-1" size={18} />
                        <div>
                            <p className="font-bold text-ember">Heavy congestion predicted</p>
                            <p className="text-sm text-white/60">Location: <span className="text-white">Civic Center</span></p>
                            <p className="text-sm text-white/60">Probability: <span className="text-lime font-bold">89%</span></p>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 rounded-xl bg-cyan/5 border border-cyan/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-cyan mb-2">Suggested Action</p>
                    <p className="text-sm text-white/80 leading-relaxed">
                        Extend green signal by <span className="text-cyan font-black">12 sec</span> at Junction 4 to dissipate queue before peak.
                    </p>
                    <Button className="w-full mt-4 bg-cyan/10 border-cyan/30 text-cyan hover:bg-cyan/20 h-9 text-xs">
                        Authorize AI Action
                    </Button>
                </div>
            </div>
          </Card>

          {/* Quick Analytics Bar Chart */}
          <Card>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-lime" size={18} /> Performance Metrics
            </h2>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analyticsData}>
                    <XAxis dataKey="name" hide />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ background: "#07171b", border: "1px solid #333" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {analyticsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
                {analyticsData.map(item => (
                    <div key={item.name} className="flex items-center gap-2 text-[10px] text-white/60 uppercase font-bold">
                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        {item.name}
                    </div>
                ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Analytics Charts Row */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-0 overflow-hidden">
            <div className="p-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Zap className="text-cyan" size={18} /> Predictive Flux
                </h2>
                <p className="text-xs text-white/40 mb-4">Traffic Density (Veh/Km) vs AI Prediction</p>
            </div>
            <div className="h-[250px] w-full px-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficSeries}>
                        <defs>
                            <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#18f2ff" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#18f2ff" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ background: "#07171b", border: "1px solid #18f2ff33" }} />
                        <Area type="monotone" dataKey="density" stroke="#18f2ff" fillOpacity={1} fill="url(#colorDensity)" strokeWidth={3} />
                        <Area type="monotone" dataKey="predicted" stroke="#8cff5a" fill="transparent" strokeDasharray="5 5" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>

        <Card>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Bell className="text-ember" size={18} /> Incident Log
                </h2>
                <span className="text-[10px] bg-ember/20 text-ember px-2 py-0.5 rounded border border-ember/30 uppercase font-black">Critical</span>
            </div>
            <div className="space-y-3">
                {alerts.map((alert, i) => (
                    <motion.div 
                        key={alert.id || i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 rounded-lg bg-white/5 border-l-2 border-cyan/50 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-bold text-white/90">{alert.title}</p>
                            <span className="text-[10px] text-white/30">Now</span>
                        </div>
                        <p className="text-xs text-white/50 mt-1">{alert.description || "System detected anomaly at junction."}</p>
                    </motion.div>
                ))}
            </div>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon, trend, color }: { label: string; value: any; icon: React.ReactNode; trend?: string; color: "cyan" | "lime" }) {
    return (
        <Card className="relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color === 'cyan' ? 'text-cyan' : 'text-lime'}`}>
                {icon}
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">{label}</p>
            <div className="flex items-baseline gap-3">
                <h3 className="text-3xl font-black text-white">{value}</h3>
                {trend && (
                    <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-lime' : 'text-cyan'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className={`mt-4 h-1 w-full rounded-full bg-white/5 overflow-hidden`}>
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    className={`h-full ${color === 'cyan' ? 'bg-cyan' : 'bg-lime'}`}
                />
            </div>
        </Card>
    );
}

function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <div className="h-4 w-24 bg-white/5 rounded mb-4" />
      <div className="h-8 w-32 bg-white/10 rounded" />
    </Card>
  );
}
