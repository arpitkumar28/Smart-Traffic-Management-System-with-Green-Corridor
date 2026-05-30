"use client";

import dynamic from "next/dynamic";
import { Shell } from "@/components/Shell";
import { Card, Button } from "@/components/ui";
import { Ambulance, Cpu, SignalHigh, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { triggerEmergencyCorridor, fetchPrediction, type AIRecommendation, fetchSignals, type Signal, openGreenFlowSocket } from "@/lib/api";

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
  const [prediction, setPrediction] = useState<AIRecommendation | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    const loadPredictions = async () => {
        try {
            const data = await fetchPrediction();
            setPrediction(data);
        } catch (e) {
            console.error("Failed to fetch predictions");
        }
    };

    const loadSignals = async () => {
        try {
            const data = await fetchSignals();
            setSignals(data);
        } catch (e) {
            console.error("Failed to fetch signals");
        }
    }

    loadPredictions();
    loadSignals();

    const socket = openGreenFlowSocket((msg) => {
        if (msg.type === "SIGNAL_UPDATE" && msg.payload.signals) {
            setSignals(msg.payload.signals);
        }
    });

    return () => socket.close();
  }, []);

  const handleTrigger = async () => {
    setIsTriggering(true);
    try {
        await triggerEmergencyCorridor("AMB-102", "Hospital Road");
    } catch (e) {
        console.error("Manual trigger failed");
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
            className={`h-12 px-6 font-bold transition-all border-2 ${
                isTriggering 
                ? "bg-red-500/20 border-red-500 text-red-500" 
                : "bg-red-500/10 border-red-500/40 text-red-500 hover:bg-red-500/20"
            }`}
          >
            <Ambulance size={18} className="mr-2" />
            {isTriggering ? "Clearing Route..." : "🚑 Simulate Ambulance"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <LiveMap />
          </div>
          
          <div className="space-y-6">
            <Card className="border-cyan/30 bg-cyan/5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-cyan/20 rounded">
                            <Cpu className="text-cyan" size={16} />
                        </div>
                        <h2 className="font-bold text-sm uppercase tracking-wider">AI Traffic Prediction</h2>
                    </div>
                    {prediction && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-lime/20 text-lime border border-lime/30">
                            {prediction.confidence}% CONFIDENCE
                        </span>
                    )}
                </div>
                
                {prediction ? (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] text-white/40 uppercase font-bold">Location</p>
                                <p className="text-sm font-bold text-white">{prediction.zone}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase font-bold">Current</p>
                                    <p className="text-xs font-bold text-amber">{prediction.currentTraffic || 'Moderate'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase font-bold">Predicted (15m)</p>
                                    <p className="text-xs font-bold text-red-500">{prediction.predictedTraffic || 'Heavy'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-[10px] font-black text-cyan uppercase mb-1">Recommendation</p>
                            <p className="text-xs leading-relaxed text-white/80">{prediction.recommendedAction}</p>
                        </div>
                        
                        <Button className="w-full text-[10px] h-8 bg-cyan/20 border-cyan/40 text-cyan hover:bg-cyan/30 uppercase font-black">
                            <CheckCircle2 size={12} className="mr-2" />
                            Apply Adaptive Tuning
                        </Button>
                    </div>
                ) : (
                    <div className="h-32 flex items-center justify-center">
                        <div className="animate-pulse text-cyan/50 text-[10px] font-bold">ANALYZING NETWORK...</div>
                    </div>
                )}
            </Card>

            <Card className="bg-white/5 border-white/10">
                <div className="flex items-center gap-2 mb-4 text-white/40">
                    <SignalHigh size={16} />
                    <h3 className="font-bold text-[10px] uppercase tracking-widest">Signal Health</h3>
                </div>
                <div className="space-y-4">
                    {signals.length > 0 ? (
                        signals.map(signal => (
                            <SignalStatus 
                                key={signal.id}
                                name={signal.name} 
                                status={signal.status} 
                                load={signal.traffic_load} 
                                color={signal.status === 'priority' ? 'cyan' : signal.status} 
                            />
                        ))
                    ) : (
                        <div className="text-[10px] text-white/20 text-center py-4">Syncing signal data...</div>
                    )}
                </div>
            </Card>

            <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4">
                <p className="text-[10px] text-white/30 text-center uppercase font-bold tracking-tighter">GreenFlow AI Network Node v2.4.0</p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function SignalStatus({ name, status, load, color }: { name: string, status: string, load: number, color: string }) {
    const colorClass = color === 'red' ? 'text-red-500 bg-red-500/10 border-red-500/20' : 
                       color === 'green' ? 'text-lime bg-lime-500/10 border-lime-500/20' : 
                       color === 'cyan' ? 'text-cyan bg-cyan/10 border-cyan/20' :
                       'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    
    const barColor = color === 'red' ? 'bg-red-500' : 
                     color === 'green' ? 'bg-lime' : 
                     color === 'cyan' ? 'bg-cyan' :
                     'bg-yellow-500';

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-white/70 truncate mr-2">{name}</span>
                <span className={`px-2 py-0.5 rounded font-black text-[9px] border uppercase flex-shrink-0 ${colorClass}`}>
                    {status}
                </span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 ${barColor}`} 
                    style={{ width: `${load}%` }} 
                />
            </div>
        </div>
    )
}
