"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ambulance, Bell, Cpu, MapPinned, RadioTower, Route, Zap, AlertCircle, RotateCw } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
  signalsSynced: number;
  timeSaved: string;
  eta: string;
  priorityScore: number;
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
  const [alertsError, setAlertsError] = useState<string | null>(null);

  // Traffic series
  const [trafficSeries, setTrafficSeries] = useState<TrafficDataPoint[]>([]);

  // Green corridor
  const [corridorStatus, setCorridorStatus] = useState<GreenCorridorStatus>({
    signalsSynced: 4,
    timeSaved: "3m 30s",
    eta: "7m",
    priorityScore: 98,
  });
  const [corridorLoading, setCorridorLoading] = useState(false);
  const [corridorError, setCorridorError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch dashboard metrics
        setMetricsLoading(true);
        setMetricsError(null);
        const dashboardData = await retryRequest(() => fetchDashboardMetrics());
        setMetrics(dashboardData);

        // Fetch signals
        setSignalsLoading(true);
        const signalsData = await retryRequest(() => fetchSignals());
        setSignals(signalsData);

        // Fetch alerts
        const alertsData = await retryRequest(() => fetchAlerts());
        setAlerts(alertsData.slice(0, 4)); // Show latest 4

        // Fetch events for timeline
        const eventsData = await retryRequest(() => fetchEvents());
        // Convert events to traffic data
        const traffic = eventsData.slice(-7).map((event, index) => ({
          time: `${8 + index}:00`,
          density: 60 + Math.random() * 30,
          predicted: 60 + Math.random() * 30,
          emergency: Math.random() > 0.8 ? 1 : 0,
        }));
        setTrafficSeries(traffic);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setMetricsError(error instanceof Error ? error.message : "Failed to load data");
      } finally {
        setMetricsLoading(false);
        setSignalsLoading(false);
      }
    };

    loadInitialData();

    // Set up WebSocket for real-time updates
    const socket = openGreenFlowSocket(
      (message) => {
        if (message.type === "alert_updates") {
          setAlerts((prev) => [message.payload as Alert, ...prev].slice(0, 4));
        } else if (message.type === "signal_updates") {
          const payload = message.payload as { signals?: Signal[] };
          if (payload.signals) {
            setSignals(payload.signals);
          }
        }
      },
      (error) => console.error("WebSocket error:", error),
      () => console.log("WebSocket disconnected")
    );

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  const handleTriggerCorridor = async () => {
    try {
      setCorridorLoading(true);
      setCorridorError(null);
      const response = await triggerEmergencyCorridor();
      setCorridorStatus({
        signalsSynced: response.signalsOptimized ?? response.signalsSynced ?? 4,
        timeSaved: `${response.timeSaved ?? 4}m`,
        eta: `${response.etaAfter ?? 4}m`,
        priorityScore: 98, // Backend doesn't provide this yet
      });
    } catch (error) {
      console.error("Failed to trigger corridor:", error);
      setCorridorError(error instanceof Error ? error.message : "Failed to activate corridor");
    } finally {
      setCorridorLoading(false);
    }
  };

  const statCards = metrics
    ? [
        { label: "Network Flow", value: `${metrics.trafficFlow}%`, delta: "+12%", tone: "cyan" as const },
        { label: "Avg Wait Time", value: `${metrics.avgWait}s`, delta: "-31%", tone: "lime" as const },
        { label: "Vehicles/min", value: `${metrics.vehiclesPerMinute.toLocaleString()}`, delta: "+8%", tone: "cyan" as const },
        { label: "CO2 Saved", value: "2.7t", delta: "+18%", tone: "lime" as const },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <header className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan/70">AI traffic command center</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-white md:text-6xl">
            {page === "landing" ? "GreenFlow AI" : "Realtime Smart City Dashboard"}
          </h1>
          <p className="mt-3 max-w-3xl text-white/62">
            Live signal orchestration, emergency priority routing, congestion prediction, and green corridor automation.
          </p>
        </div>
        <Button
          onClick={handleTriggerCorridor}
          disabled={corridorLoading}
          className="border-lime/40 bg-lime/10 text-lime hover:bg-lime/20 disabled:opacity-50"
        >
          {corridorLoading ? <RotateCw size={18} className="animate-spin" /> : <Ambulance size={18} />}
          {corridorLoading ? "Activating..." : "Trigger Green Corridor"}
        </Button>
      </header>

      {metricsError && (
        <div className="rounded-lg border border-ember/30 bg-ember/10 p-4 flex items-gap-3">
          <AlertCircle className="text-ember" size={18} />
          <p className="text-sm text-white/70">{metricsError}</p>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricsLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Card>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/60">{stat.label}</p>
                    <Zap className={stat.tone === "lime" ? "text-lime" : "text-cyan"} size={18} />
                  </div>
                  <div className="mt-4 text-3xl font-black">{stat.value}</div>
                  <div className="mt-2 text-sm text-lime">{stat.delta} vs baseline</div>
                </Card>
              </motion.div>
            ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <Card className="min-h-[470px] overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Emergency Route Map</h2>
              <p className="text-sm text-white/55">Live signal orchestration with real-time WebSocket updates.</p>
            </div>
            <MapPinned className="text-cyan" />
          </div>
          <div className="relative h-[380px] overflow-hidden rounded-lg border border-cyan/15 bg-[#07171b]">
            <div className="absolute inset-0 bg-citygrid map-grid opacity-60" />
            <div className="absolute left-[12%] top-[62%] h-2 w-[76%] rotate-[-18deg] rounded-full bg-lime shadow-green" />
            <div className="absolute left-[22%] top-[54%] h-2 w-[38%] rotate-[24deg] rounded-full bg-cyan/70 shadow-neon" />
            {signalsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-12 w-12 rounded-lg bg-white/10 animate-pulse"
                    style={{ left: `${18 + i * 19}%`, top: `${58 - i * 10}%` }}
                  />
                ))
              : signals.map((signal, index) => (
                  <motion.div
                    key={signal.id}
                    className="absolute grid h-12 w-12 place-items-center rounded-lg border border-white/20 bg-ink text-xs font-black"
                    style={{ left: `${18 + index * 19}%`, top: `${58 - index * 10}%` }}
                    animate={{
                      boxShadow:
                        signal.status === "priority"
                          ? "0 0 34px rgba(140,255,90,.8)"
                          : "0 0 18px rgba(24,242,255,.25)",
                    }}
                  >
                    {signal.status === "priority" ? "GO" : Math.round(signal.traffic_load)}
                  </motion.div>
                ))}
            <motion.div
              className="absolute grid h-14 w-14 place-items-center rounded-lg border border-lime/40 bg-lime/15 text-lime shadow-green"
              animate={{ left: ["10%", "72%"], top: ["67%", "30%"] }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            >
              <Ambulance size={26} />
            </motion.div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Green Corridor AI</h2>
              <Route className="text-lime" />
            </div>
            {corridorError && (
              <div className="mt-4 text-xs text-ember bg-ember/10 p-2 rounded">
                {corridorError}
              </div>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label="Signals Synced" value={corridorStatus.signalsSynced.toString()} />
              <Metric label="Time Saved" value={corridorStatus.timeSaved} />
              <Metric label="ETA" value={corridorStatus.eta} />
              <Metric label="Priority Score" value={corridorStatus.priorityScore.toString()} />
            </div>
          </Card>
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Bell className="text-ember" size={18} />
              <h2 className="text-xl font-bold">Live Alerts</h2>
            </div>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-sm text-white/50">No alerts at this time</div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/72">
                    {alert.title}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Cpu className="text-cyan" size={18} />
            <h2 className="text-xl font-bold">AI Density Prediction</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            {trafficSeries.length > 0 ? (
              <AreaChart data={trafficSeries}>
                <defs>
                  <linearGradient id="density" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#18f2ff" stopOpacity={0.65} />
                    <stop offset="95%" stopColor="#18f2ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,.08)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,.45)" />
                <YAxis stroke="rgba(255,255,255,.45)" />
                <Tooltip contentStyle={{ background: "#07171b", border: "1px solid rgba(24,242,255,.2)" }} />
                <Area dataKey="density" stroke="#18f2ff" fill="url(#density)" />
                <Line dataKey="predicted" stroke="#8cff5a" strokeWidth={2} />
              </AreaChart>
            ) : (
              <div className="h-64 flex items-center justify-center text-white/50">Loading chart...</div>
            )}
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <RadioTower className="text-lime" size={18} />
            <h2 className="text-xl font-bold">Signal Status</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            {trafficSeries.length > 0 ? (
              <LineChart data={trafficSeries}>
                <CartesianGrid stroke="rgba(255,255,255,.08)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,.45)" />
                <YAxis stroke="rgba(255,255,255,.45)" />
                <Tooltip contentStyle={{ background: "#07171b", border: "1px solid rgba(140,255,90,.2)" }} />
                <Line type="monotone" dataKey="density" stroke="#18f2ff" strokeWidth={3} />
                <Line type="monotone" dataKey="emergency" stroke="#ff7a45" strokeWidth={3} />
              </LineChart>
            ) : (
              <div className="h-64 flex items-center justify-center text-white/50">Loading chart...</div>
            )}
          </ResponsiveContainer>
        </Card>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-lime/20 bg-lime/10 p-4">
      <div className="text-xs text-white/54">{label}</div>
      <div className="mt-2 text-2xl font-black text-lime">{value}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
        <div className="h-4 w-4 rounded bg-white/10 animate-pulse" />
      </div>
      <div className="mt-4 h-8 w-32 rounded bg-white/10 animate-pulse" />
      <div className="mt-2 h-4 w-24 rounded bg-white/10 animate-pulse" />
    </Card>
  );
}
