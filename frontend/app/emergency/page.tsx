"use client";

import { useEffect, useState } from "react";
import { Ambulance, AlertCircle, Siren, TimerReset, RotateCw } from "lucide-react";
import type { ReactNode } from "react";
import { Shell } from "@/components/Shell";
import { Button, Card } from "@/components/ui";
import { triggerEmergencyCorridor, fetchEvents, openGreenFlowSocket, type GreenCorridorResponse, type Event } from "@/lib/api";

export default function EmergencyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [corridorStatus, setCorridorStatus] = useState<{
    signalsSynced: number;
    eta: string;
    timeSaved: string;
  } | null>(null);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Fetch initial events
    fetchEvents()
      .then((events) => {
        setRecentEvents(events.slice(0, 3));
      })
      .catch((err) => console.error("Failed to fetch events:", err));

    // Set up WebSocket for real-time events
    const socket = openGreenFlowSocket(
      (message) => {
        if (message.type === "event_update") {
          const event = message.payload as Event;
          setRecentEvents((prev) => [event, ...prev].slice(0, 3));
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
      setLoading(true);
      setError(null);
      const response = await triggerEmergencyCorridor();
      
      // Extract and display the response data
      setCorridorStatus({
        signalsSynced: response.signalsOptimized ?? response.signalsSynced ?? 0,
        eta: `${response.etaAfter ?? 0}m`,
        timeSaved: `${response.timeSaved ?? 0}m ${response.timeSaved ? Math.floor((response.timeSaved % 1) * 60) : 0}s`,
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
      <div className="mx-auto max-w-7xl space-y-6 py-6">
        <h1 className="text-4xl font-black">Emergency Control</h1>
        
        {error && (
          <div className="rounded-lg border border-ember/30 bg-ember/10 p-4 flex items-center gap-3">
            <AlertCircle className="text-ember" size={18} />
            <p className="text-sm text-white/70">{error}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <Card>
            <Siren className="mb-4 text-ember" size={42} />
            <h2 className="text-2xl font-black">Green Corridor AI</h2>
            <p className="mt-3 text-white/58">Activate priority routing for emergency vehicles and synchronize nearby intersections in real-time.</p>
            <Button 
              className="mt-6 border-lime/40 bg-lime/10 text-lime hover:bg-lime/20 disabled:opacity-50" 
              onClick={handleTriggerCorridor}
              disabled={loading}
            >
              {loading ? <RotateCw className="animate-spin" size={18} /> : <Ambulance size={18} />}
              {loading ? "Activating..." : "Activate Ambulance Mode"}
            </Button>
          </Card>
          <Card>
            <h2 className="text-xl font-bold">Emergency Analytics</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {corridorStatus ? (
                <>
                  <Panel icon={<TimerReset />} label="ETA" value={corridorStatus.eta} />
                  <Panel icon={<Ambulance />} label="Signals Synced" value={corridorStatus.signalsSynced.toString()} />
                  <Panel icon={<Siren />} label="Time Saved" value={corridorStatus.timeSaved} />
                </>
              ) : (
                <>
                  <Panel icon={<TimerReset />} label="ETA" value="--" />
                  <Panel icon={<Ambulance />} label="Signals Synced" value="0" />
                  <Panel icon={<Siren />} label="Time Saved" value="--" />
                </>
              )}
            </div>
          </Card>
        </div>

        {recentEvents.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold">Recent Events</h2>
            <div className="mt-5 space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/72">
                  <p className="font-semibold">{event.event}</p>
                  <p className="text-xs text-white/50 mt-1">{new Date(event.timestamp).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Shell>
  );
}

function Panel({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-5 text-lime">
      {icon}
      <p className="mt-4 text-sm text-white/55">{label}</p>
      <b className="text-3xl">{value}</b>
    </div>
  );
}
