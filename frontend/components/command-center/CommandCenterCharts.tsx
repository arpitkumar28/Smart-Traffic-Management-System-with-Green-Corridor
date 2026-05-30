"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { riskDistribution, trafficTrend } from "@/lib/commandCenterData";

export function CommandCenterCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.85fr]">
      <div className="rounded-[24px] border border-white/10 bg-[#07131a]/95 p-5 shadow-[0_0_40px_rgba(140,255,90,0.08)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan/60">Traffic flow</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Demand vs throughput</h3>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">Live</span>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficTrend} margin={{ top: 10, right: 18, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="flowGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#18f2ff" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#18f2ff" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.45)" tick={{ fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.45)" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#07171b", border: "1px solid rgba(24,242,255,0.15)" }} />
              <Area type="monotone" dataKey="flow" stroke="#18f2ff" fill="url(#flowGradient)" strokeWidth={3} />
              <Line type="monotone" dataKey="demand" stroke="#8cff5a" strokeWidth={3} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-[#07131a]/95 p-5 shadow-[0_0_40px_rgba(24,242,255,0.08)]">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan/60">Risk levels</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Sector exposure</h3>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskDistribution} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.45)" tick={{ fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.45)" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#07171b", border: "1px solid rgba(140,255,90,0.18)" }} />
              <Bar dataKey="value" fill="#8cff5a" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
