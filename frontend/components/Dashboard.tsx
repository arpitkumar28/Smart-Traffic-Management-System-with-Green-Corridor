"use client";

import { motion } from "framer-motion";
import { Ambulance, Bell, Cpu, MapPinned, RadioTower, Route, Zap } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button, Card } from "@/components/ui";
import { alerts, signals, stats, trafficSeries } from "@/lib/data";
import { triggerEmergencyCorridor } from "@/lib/firebase";

export function Dashboard({ page = "dashboard" }: { page?: string }) {
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
        <Button onClick={() => void triggerEmergencyCorridor()} className="border-lime/40 bg-lime/10 text-lime hover:bg-lime/20">
          <Ambulance size={18} />
          Trigger Green Corridor
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
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
              <p className="text-sm text-white/55">Google Maps-ready corridor visualization with simulated fallback.</p>
            </div>
            <MapPinned className="text-cyan" />
          </div>
          <div className="relative h-[380px] overflow-hidden rounded-lg border border-cyan/15 bg-[#07171b]">
            <div className="absolute inset-0 bg-citygrid map-grid opacity-60" />
            <div className="absolute left-[12%] top-[62%] h-2 w-[76%] rotate-[-18deg] rounded-full bg-lime shadow-green" />
            <div className="absolute left-[22%] top-[54%] h-2 w-[38%] rotate-[24deg] rounded-full bg-cyan/70 shadow-neon" />
            {signals.map((signal, index) => (
              <motion.div
                key={signal.id}
                className="absolute grid h-12 w-12 place-items-center rounded-lg border border-white/20 bg-ink text-xs font-black"
                style={{ left: `${18 + index * 19}%`, top: `${58 - index * 10}%` }}
                animate={{ boxShadow: signal.status === "priority" ? "0 0 34px rgba(140,255,90,.8)" : "0 0 18px rgba(24,242,255,.25)" }}
              >
                {signal.status === "priority" ? "GO" : signal.load}
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
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label="Signals Synced" value="4" />
              <Metric label="Time Saved" value="3m 30s" />
              <Metric label="ETA" value="7m" />
              <Metric label="Priority Score" value="98" />
            </div>
          </Card>
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Bell className="text-ember" size={18} />
              <h2 className="text-xl font-bold">Live Alerts</h2>
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/72">
                  {alert}
                </div>
              ))}
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
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <RadioTower className="text-lime" size={18} />
            <h2 className="text-xl font-bold">Signal Status</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trafficSeries}>
              <CartesianGrid stroke="rgba(255,255,255,.08)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,.45)" />
              <YAxis stroke="rgba(255,255,255,.45)" />
              <Tooltip contentStyle={{ background: "#07171b", border: "1px solid rgba(140,255,90,.2)" }} />
              <Line type="monotone" dataKey="density" stroke="#18f2ff" strokeWidth={3} />
              <Line type="monotone" dataKey="emergency" stroke="#ff7a45" strokeWidth={3} />
            </LineChart>
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
