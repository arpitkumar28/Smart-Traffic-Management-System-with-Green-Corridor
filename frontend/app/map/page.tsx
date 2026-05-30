"use client";

import dynamic from "next/dynamic";
import { Shell } from "@/components/Shell";
import { Card, Button } from "@/components/ui";
import { Ambulance, Cpu, SignalHigh } from "lucide-react";
import { useState } from "react";
import { triggerEmergencyCorridor } from "@/lib/api";

// Dynamically import the LiveMap component with SSR disabled
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-10rem)] items-center justify-center rounded-xl border border-white/10 bg-[#07171b] text-white/50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan border-t-transparent" />
        <p className="text-sm font-black tracking-widest uppercase text-cyan/70">Initializing Map Engine...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [isTriggering, setIsTriggering] = useState(false);

  const handleTrigger = async () => {
    setIsTriggering(true);
    try {
        await triggerEmergencyCorridor("AMB-102", "City Hospital");
    } catch (e) {
        console.error("Manual trigger failed, simulation fallback in LiveMap handles display.");
    } finally {
        setTimeout(() => setIsTriggering(false), 2000);
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6 py-6 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan/70">Satellite Stream Active</p>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Live Traffic Grid</h1>
          </div>
          
          <Button 
            onClick={handleTrigger}
            disabled={isTriggering}
            className={`h-12 px-6 font-bold transition-all ${
                isTriggering 
                ? "bg-red-500/20 border-red-500 text-red-500" 
                : "bg-lime/10 border-lime/40 text-lime hover:bg-lime/20"
            }`}
          >
            <Ambulance size={18} className="mr-2" />
            {isTriggering ? "Clearing Route..." : "Trigger Green Corridor"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <LiveMap />
          </div>
          
          <div className="space-y-6">
            <Card className="border-cyan/30 bg-cyan/5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-cyan/20 rounded">
                        <Cpu className="text-cyan" size={16} />
                    </div>
                    <h2 className="font-bold text-sm uppercase tracking-wider">AI Optimizer</h2>
                </div>
                <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-ember/10 border border-ember/20">
                        <p className="text-[10px] font-black text-ember uppercase mb-1">Heavy Congestion</p>
                        <p className="text-sm font-bold">Civic Center Junction</p>
                        <p className="text-[10px] text-white/60 mt-1">Probability: <span className="text-lime">89%</span></p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-[10px] font-black text-cyan uppercase mb-1">Action Suggested</p>
                        <p className="text-xs leading-relaxed text-white/80">Extend green signal at South Park by 12s to dissipate tailback.</p>
                    </div>
                    <Button className="w-full text-[10px] h-8 bg-cyan/20 border-cyan/40 text-cyan hover:bg-cyan/30 uppercase font-black">Apply Tuning</Button>
                </div>
            </Card>

            <Card className="bg-white/5 border-white/10">
                <div className="flex items-center gap-2 mb-4 text-white/40">
                    <SignalHigh size={16} />
                    <h3 className="font-bold text-[10px] uppercase tracking-widest">Signal Health</h3>
                </div>
                <div className="space-y-4">
                    <SignalStatus name="Metro Junction" status="Red" load={82} color="red" />
                    <SignalStatus name="Hospital Road" status="Green" load={35} color="lime" />
                    <SignalStatus name="Civic Center" status="Yellow" load={65} color="yellow" />
                    <SignalStatus name="South Park" status="Green" load={22} color="lime" />
                </div>
            </Card>

            <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4">
                <p className="text-[10px] text-white/30 text-center uppercase font-bold tracking-tighter">System Version 2.4.0-Stable</p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function SignalStatus({ name, status, load, color }: { name: string, status: string, load: number, color: string }) {
    const colorClass = color === 'red' ? 'text-red-500 bg-red-500/10 border-red-500/20' : 
                       color === 'lime' ? 'text-lime bg-lime-500/10 border-lime-500/20' : 
                       'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-white/70">{name}</span>
                <span className={`px-2 py-0.5 rounded font-black text-[9px] border uppercase ${colorClass}`}>
                    {status}
                </span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${color === 'red' ? 'bg-red-500' : color === 'lime' ? 'bg-lime' : 'bg-yellow-500'}`} 
                    style={{ width: `${load}%` }} 
                />
            </div>
        </div>
    )
}
