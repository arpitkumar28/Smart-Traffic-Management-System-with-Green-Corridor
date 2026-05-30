"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RotateCw, TrendingUp, Clock, Leaf, Ambulance, BarChart3, PieChart } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui";
import { fetchAnalytics, retryRequest, type AnalyticsData } from "@/lib/api";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart as RePieChart, Pie, Legend, LineChart, Line
} from "recharts";

const trafficVolumeData = [
  { time: '08:00', volume: 450, wait: 45 },
  { time: '09:00', volume: 820, wait: 120 },
  { time: '10:00', volume: 780, wait: 95 },
  { time: '11:00', volume: 600, wait: 60 },
  { time: '12:00', volume: 550, wait: 55 },
  { time: '13:00', volume: 580, wait: 58 },
  { time: '14:00', volume: 620, wait: 65 },
];

const co2Data = [
  { zone: 'North', reduction: 1.2 },
  { zone: 'South', reduction: 2.1 },
  { zone: 'Central', reduction: 3.4 },
  { zone: 'East', reduction: 0.8 },
  { zone: 'West', reduction: 1.5 },
];

const responseTimeData = [
  { name: 'Standard', value: 12, color: '#ff3b30' },
  { name: 'AI Priority', value: 4, color: '#8cff5a' },
];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await retryRequest(() => fetchAnalytics());
        const analyticsArray = Array.isArray(data)
          ? data
          : Array.isArray(data?.analytics)
            ? data.analytics
            : [];
        setAnalyticsData(analyticsArray);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        // Error handling but we'll show mock charts anyway for demo
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-8 py-10 px-6">
        <header>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan/70 mb-2">System Insights</p>
            <h1 className="text-5xl font-black text-white tracking-tighter">Performance Analytics</h1>
        </header>
        
        {error && (
          <div className="rounded-lg border border-ember/30 bg-ember/10 p-4 flex items-center gap-3">
            <AlertCircle className="text-ember" size={18} />
            <p className="text-sm text-white/70">{error}</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-4">
          <StatCard title="Total Traffic Volume" value="48.2k" icon={<BarChart3 className="text-cyan" />} trend="+12%" />
          <StatCard title="Avg Waiting Time" value="42s" icon={<Clock className="text-lime" />} trend="-18%" />
          <StatCard title="CO₂ Reduction" value="12.4t" icon={<Leaf className="text-lime" />} trend="+24%" />
          <StatCard title="Emergency Response" value="4.2m" icon={<Ambulance className="text-cyan" />} trend="-35%" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><TrendingUp className="text-cyan" size={20} /> Traffic Volume vs Waiting Time</h2>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trafficVolumeData}>
                            <defs>
                                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#18f2ff" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#18f2ff" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                            <Tooltip contentStyle={{ background: "#07171b", border: "1px solid #18f2ff33" }} />
                            <Area type="monotone" dataKey="volume" stroke="#18f2ff" fillOpacity={1} fill="url(#colorVol)" strokeWidth={3} />
                            <Area type="monotone" dataKey="wait" stroke="#ffb020" fill="transparent" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Leaf className="text-lime" size={20} /> CO₂ Reduction by Zone (Tons)</h2>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={co2Data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="zone" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                            <Tooltip contentStyle={{ background: "#07171b", border: "1px solid #333" }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                            <Bar dataKey="reduction" radius={[4, 4, 0, 0]}>
                                {co2Data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 2 ? '#8cff5a' : '#2dd4bf'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Ambulance className="text-red-500" size={20} /> Emergency Response Time (Min)</h2>
                </div>
                <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                            <Pie
                                data={responseTimeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {responseTimeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: "#07171b", border: "1px solid #333" }} />
                            <Legend verticalAlign="bottom" height={36}/>
                        </RePieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-black text-white">66%</span>
                        <span className="text-[10px] text-white/40 uppercase">Faster</span>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><TrendingUp className="text-cyan" size={20} /> System Efficiency</h2>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trafficVolumeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                            <Tooltip contentStyle={{ background: "#07171b", border: "1px solid #333" }} />
                            <Line type="monotone" dataKey="volume" stroke="#18f2ff" strokeWidth={3} dot={{ r: 4, fill: '#18f2ff' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
      </div>
    </Shell>
  );
}

function StatCard({ title, value, icon, trend }: { title: string; value: string; icon: React.ReactNode; trend: string }) {
    return (
        <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-white/5 rounded-lg">
                    {icon}
                </div>
                <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-lime' : 'text-cyan'}`}>
                    {trend}
                </span>
            </div>
            <p className="text-xs text-white/50 uppercase font-bold tracking-wider">{title}</p>
            <p className="text-3xl font-black text-white mt-1">{value}</p>
        </Card>
    );
}
