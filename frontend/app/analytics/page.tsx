"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Clock, 
  Leaf, 
  Ambulance, 
  BarChart3, 
  Zap, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart as RePieChart, Pie, Legend
} from "recharts";

const performanceData = [
  { time: '00:00', flow: 45, latency: 12 },
  { time: '04:00', flow: 32, latency: 10 },
  { time: '08:00', flow: 88, latency: 18 },
  { time: '12:00', flow: 76, latency: 15 },
  { time: '16:00', flow: 92, latency: 22 },
  { time: '20:00', flow: 64, latency: 14 },
  { time: '23:59', flow: 48, latency: 11 },
];

const impactData = [
  { category: 'Fuel Saved', value: 85, color: '#00E5FF' },
  { category: 'CO2 Reduction', value: 92, color: '#00FF88' },
  { category: 'Time Saved', value: 78, color: '#FFC857' },
  { category: 'AI Accuracy', value: 96, color: '#FFFFFF' },
];

const responseTimeData = [
  { name: 'Standard Response', value: 12, color: 'rgba(255,255,255,0.1)' },
  { name: 'GreenFlow Priority', value: 4.2, color: '#00FF88' },
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Shell>
      <div className="flex flex-col gap-8 pb-10">
        <header className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Mission Critical Intelligence</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-[900] text-text-primary tracking-tighter uppercase">AI INTELLIGENCE & ANALYTICS</h1>
        </header>

        {/* TOP LEVEL METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsStatCard 
            label="AVERAGE DELAY REDUCED" 
            value="24.8%" 
            subValue="-4.2m / trip"
            trend="up"
            icon={<Clock className="text-primary" />} 
          />
          <AnalyticsStatCard 
            label="EMERGENCY RESPONSE TIME" 
            value="4.2m" 
            subValue="-66% vs Baseline"
            trend="up"
            icon={<Ambulance className="text-success" />} 
          />
          <AnalyticsStatCard 
            label="FUEL SAVED (EST.)" 
            value="1,842L" 
            subValue="+12% Efficiency"
            trend="up"
            icon={<Zap className="text-warning" />} 
          />
          <AnalyticsStatCard 
            label="CO2 REDUCTION" 
            value="4.2t" 
            subValue="Verified Impact"
            trend="up"
            icon={<Leaf className="text-success" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* TRAFFIC FLOW ANALYSIS */}
            <Card className="glow-card p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black tracking-widest uppercase">System Flux Analysis</h2>
                        <p className="text-xs text-text-secondary uppercase mt-1">Real-time throughput vs network latency</p>
                    </div>
                    <Activity size={20} className="text-primary" />
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                            <defs>
                                <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0D1B24', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '8px' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="flow" stroke="#00E5FF" fillOpacity={1} fill="url(#colorFlow)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* IMPACT METRICS */}
            <Card className="glow-card p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black tracking-widest uppercase">Impact Metrics</h2>
                        <p className="text-xs text-text-secondary uppercase mt-1">AI decision performance across categories</p>
                    </div>
                    <BarChart3 size={20} className="text-success" />
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={impactData} layout="vertical" margin={{ left: 40 }}>
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="category" 
                                type="category" 
                                stroke="rgba(255,255,255,0.65)" 
                                fontSize={10} 
                                axisLine={false} 
                                tickLine={false}
                                width={100}
                            />
                            <Tooltip 
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                contentStyle={{ backgroundColor: '#0D1B24', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {impactData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* RESPONSE TIME OPTIMIZATION */}
            <Card className="glow-card p-8 space-y-6 lg:col-span-2 bg-gradient-to-r from-card to-secondary-background">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <div>
                            <h2 className="text-2xl font-[900] tracking-widest uppercase">Response Optimization</h2>
                            <p className="text-sm text-text-secondary uppercase mt-2 leading-relaxed max-w-xl">
                                Our AI Engine prioritizes emergency vehicles by calculating the optimal "Green Path" 
                                across the city grid, reducing standard response times by an average of <span className="text-success font-black">66%</span>.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                                <p className="text-[10px] font-black text-text-secondary uppercase mb-2">AI Decisions Made</p>
                                <p className="text-3xl font-[900] text-primary">14,282</p>
                            </div>
                            <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                                <p className="text-[10px] font-black text-text-secondary uppercase mb-2">Priority Success</p>
                                <p className="text-3xl font-[900] text-success">99.8%</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-[300px] h-[300px] relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={responseTimeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {responseTimeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RePieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-4xl font-[900] text-success tracking-tighter">4.2m</span>
                            <span className="text-[10px] font-black text-text-secondary uppercase">Average Priority</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </Shell>
  );
}

function AnalyticsStatCard({ label, value, subValue, trend, icon }: { 
    label: string, 
    value: string, 
    subValue: string, 
    trend: 'up' | 'down',
    icon: React.ReactNode 
}) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glow-card p-6 space-y-4"
        >
            <div className="flex items-center justify-between">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    {icon}
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded",
                    trend === 'up' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                )}>
                    {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    OPTIMIZED
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-text-secondary tracking-[0.2em] uppercase">{label}</p>
                <h3 className="text-3xl font-[900] text-text-primary mt-1">{value}</h3>
            </div>
            <p className="text-[11px] font-bold text-text-secondary uppercase opacity-60">
                {subValue}
            </p>
        </motion.div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
