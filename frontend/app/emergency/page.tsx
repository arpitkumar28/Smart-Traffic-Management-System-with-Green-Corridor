"use client";

import { useEffect, useState } from "react";
import { Ambulance, AlertCircle, Siren, TimerReset, RotateCw, ShieldCheck, Activity, Zap, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { Shell } from "@/components/Shell";
import { Card, cn } from "@/components/ui";
import { triggerEmergencyCorridor, fetchEvents, type TrafficEvent } from "@/lib/api";
import useRealtime from "@/hooks/useRealtime";
import { motion, AnimatePresence } from "framer-motion";

export default function EmergencyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [corridorStatus, setCorridorStatus] = useState<{
    signalsSynced: number;
    eta: string;
    timeSaved: string;
    ambulance: string;
    destination: string;
  } | null>(null);
  const [recentEvents, setRecentEvents] = useState<TrafficEvent[]>([]);

  const { status: realtimeStatus } = useRealtime((type, payload) => {
    if (type !== "event.created" && type !== "corridor.activated") return;
    const message = payload as { event?: TrafficEvent } | TrafficEvent;
    const event = "event" in message && typeof message.event === "object" && message.event
      ? message.event
      : message as TrafficEvent;
    setRecentEvents((prev) => [event, ...prev].slice(0, 5));
  }, (err) => console.error("WebSocket error:", err));

  useEffect(() => {
    // Fetch initial events
    fetchEvents()
      .then((events) => {
        setRecentEvents(events.slice(0, 5));
      })
      .catch((err) => console.error("Failed to fetch events:", err));

  }, []);

  const handleTriggerCorridor = async () => {
    try {
      setLoading(true);
      setError(null);
      setConfirmOpen(false);
      const response = await triggerEmergencyCorridor("AMB-102", "City General Hospital");
      
      setCorridorStatus({
        signalsSynced: response.signalsOptimized ?? response.signalsSynced ?? 0,
        eta: response.etaAfter === undefined ? "Not reported" : `${response.etaAfter}m`,
        timeSaved: response.timeSaved === undefined ? "Not reported" : `-${response.timeSaved}m`,
        ambulance: response.ambulance ?? "Not reported",
        destination: response.destination ?? "Not reported",
      });

    } catch (err) {
      console.error("Failed to trigger corridor:", err);
      setError(err instanceof Error ? err.message : "Failed to activate emergency corridor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-8 py-8 px-4">
        <header>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-danger/10 rounded-lg border border-danger/20">
                    <Siren className="text-danger animate-pulse" size={24} />
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Emergency <span className="text-danger">Control</span></h1>
            </div>
            <p className="text-text-secondary font-medium uppercase tracking-widest text-[10px]">Critical Infrastructure Access • Priority Routing</p>
        </header>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-xl border border-danger/30 bg-danger/10 p-4 flex items-center gap-3 backdrop-blur-md"
            >
              <AlertCircle className="text-danger" size={18} />
              <p className="text-sm font-bold text-white/90">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          <Card className="p-8 border-border relative overflow-hidden group rounded-xl backdrop-blur-md">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Siren size={160} />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <ShieldCheck className="text-primary" size={20} />
                    <span className="text-[10px] font-black tracking-widest text-primary uppercase">Protocol 08: Green Corridor</span>
                </div>
                
                <h2 className="text-3xl font-black text-white mb-4">EMERGENCY PRIORITY</h2>
                <p className="text-text-secondary font-medium leading-relaxed mb-8">
                  Synchronizes all traffic nodes along the optimal route for emergency vehicles, creating an unimpeded "green flow" through the city.
                </p>

                <div className="space-y-4">
                    <button 
                        className={cn(
                            "w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-lg tracking-tight border",
                            loading 
                                ? "bg-panel border-border text-text-secondary cursor-not-allowed" 
                                : corridorStatus 
                                    ? "bg-danger text-white border-danger shadow-[0_0_30px_rgba(233,91,91,0.4)]"
                                    : "bg-success text-background border-success shadow-[0_0_25px_rgba(49,215,123,0.3)] hover:scale-[1.02]"
                        )} 
                        onClick={() => setConfirmOpen(true)}
                        disabled={loading}
                    >
                        {loading ? <RotateCw className="animate-spin" size={24} /> : <Ambulance size={24} />}
                        {loading ? "SYNCHRONIZING NODES..." : corridorStatus ? "EMERGENCY ENGAGED" : "START LIVE EMERGENCY DEMO"}
                    </button>
                    
                    <p className="text-center text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">
                        {loading ? "Calculating optimal trajectory..." : corridorStatus ? "Priority routing active for " + corridorStatus.ambulance : "One-click activation for demonstration"}
                    </p>
                </div>
            </div>
          </Card>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Panel 
                icon={<TimerReset size={20} />} 
                label="DEMO ETA"
                value={corridorStatus?.eta ?? "--"} 
                color="text-primary"
              />
              <Panel 
                icon={<Activity size={20} />} 
                label="NODES SYNCED" 
                value={corridorStatus?.signalsSynced.toString() ?? "0"} 
                color="text-success"
              />
              <Panel 
                icon={<Zap size={20} />} 
                label="TIME SAVED" 
                value={corridorStatus?.timeSaved ?? "--"} 
                color="text-warning"
              />
            </div>

            <Card className="p-6 border-border rounded-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black tracking-widest text-white uppercase">Mission intelligence</h3>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", realtimeStatus === "LIVE" ? "bg-success animate-pulse" : "bg-warning")} />
                      <span className="text-[9px] font-black text-primary uppercase">{realtimeStatus}</span>
                    </div>
                </div>

                {corridorStatus ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase mb-1">Ambulance ID</p>
                                <p className="text-xl font-black text-white">{corridorStatus.ambulance}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase mb-1">Target Facility</p>
                                <p className="text-xl font-black text-white">{corridorStatus.destination}</p>
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3 text-success">
                                <MapPin size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">Optimal route mapped and secured</span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
                        <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-4">
                            <Activity size={20} />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">Waiting for trigger signal</p>
                    </div>
                )}
            </Card>
          </div>
        </div>

        <Card className="border-border overflow-hidden bg-panel rounded-xl backdrop-blur-md">
            <div className="px-6 py-4 border-b border-border bg-panel-alt flex items-center justify-between">
                <h2 className="text-xs font-black tracking-[0.3em] text-white uppercase">Emergency Wire Feed</h2>
                <span className="text-[9px] font-bold text-text-secondary">SYSTEM LOGS</span>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event, index) => {
                    const isEmergency = event.type === "emergency" || (event.event && event.event.includes("PRIORITY"));
                    return (
                        <motion.div 
                          key={event.id ?? index} 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                              "group relative flex gap-4 p-4 rounded-xl border transition-all duration-300",
                              isEmergency 
                                ? "bg-danger/5 border-danger/20 hover:bg-danger/10" 
                                : "bg-panel border-border hover:bg-panel-alt"
                          )}
                        >
                          <div className={cn(
                              "w-1 h-full absolute left-0 top-0 rounded-l-xl",
                              isEmergency ? "bg-danger shadow-[0_0_15px_#ff4d4d]" : "bg-primary"
                          )} />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest",
                                    isEmergency ? "text-danger" : "text-primary"
                                )}>
                                    {event.location ?? "ZONE-OPERATIONS"}
                                </span>
                                <span className="text-[8px] font-bold text-text-secondary/60">{event.timestamp ?? "LIVE"}</span>
                            </div>
                            <p className={cn(
                                "text-sm font-bold tracking-tight",
                                isEmergency ? "text-white" : "text-white/80"
                            )}>
                                {event.event ?? event.message ?? "Operational data pulse detected."}
                            </p>
                          </div>
                        </motion.div>
                    )
                  })
                ) : (
                  <div className="py-12 text-center opacity-30 italic text-sm uppercase font-bold tracking-widest">Scanning network for events...</div>
                )}
              </div>
            </div>
        </Card>
      </div>

      {confirmOpen && (
        <div className="confirm-overlay" role="presentation" onClick={() => setConfirmOpen(false)}>
          <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="emergency-confirm-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="emergency-confirm-title">Confirm live emergency demo</h2>
            <p>This will request priority routing for AMB-102 to City General Hospital and may change signal timing along the calculated route.</p>
            <div className="confirm-actions">
              <button className="outline-button" onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button className="action-button" onClick={handleTriggerCorridor} disabled={loading}>Confirm activation</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .glass-card {
          background: rgba(11, 17, 32, 0.4);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
        }
        .gf-panel {
          background: rgba(11, 17, 32, 0.4);
          -webkit-backdrop-filter: blur(20px);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          border: 1px solid var(--border);
        }
        `}</style>
    </Shell>
  );
}

function Panel({ icon, label, value, color }: { icon: ReactNode; label: string; value: string; color: string }) {
  return (
    <Card className="gf-panel p-6 border-white/5 hover:border-white/10 transition-colors group">
      <div className={cn("mb-4 group-hover:scale-110 transition-transform", color)}>
        {icon}
      </div>
      <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1">{label}</p>
      <b className={cn("text-3xl font-black tracking-tighter", color)}>{value}</b>
    </Card>
  );
}
