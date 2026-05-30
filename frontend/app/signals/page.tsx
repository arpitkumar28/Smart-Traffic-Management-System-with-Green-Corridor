"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui";
import { fetchSignals, retryRequest, type Signal } from "@/lib/api";

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSignals = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await retryRequest(() => fetchSignals());
        setSignals(data);
      } catch (err) {
        console.error("Failed to load signals:", err);
        setError(err instanceof Error ? err.message : "Failed to load signals");
      } finally {
        setLoading(false);
      }
    };

    loadSignals();
    // Refresh signals every 10 seconds
    const interval = setInterval(loadSignals, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green":
        return "text-lime border-lime/25 bg-lime/10";
      case "yellow":
        return "text-amber-300 border-amber-300/25 bg-amber-300/10";
      case "red":
        return "text-ember border-ember/25 bg-ember/10";
      case "priority":
        return "text-lime border-lime/50 bg-lime/20 font-bold";
      default:
        return "text-cyan border-cyan/25 bg-cyan/10";
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6 py-6">
        <h1 className="text-4xl font-black">Traffic Signal Management</h1>
        
        {error && (
          <div className="rounded-lg border border-ember/30 bg-ember/10 p-4 flex items-center gap-3">
            <AlertCircle className="text-ember" size={18} />
            <p className="text-sm text-white/70">{error}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <div className="h-4 w-16 rounded bg-white/10 animate-pulse" />
                <div className="mt-2 h-6 w-24 rounded bg-white/10 animate-pulse" />
                <div className="mt-5 h-8 w-32 rounded bg-white/10 animate-pulse" />
              </Card>
            ))
          ) : signals.length === 0 ? (
            <Card>
              <p className="text-white/50">No signals available</p>
            </Card>
          ) : (
            signals.map((signal) => (
              <Card key={signal.id}>
                <p className="text-sm text-white/48">{signal.id}</p>
                <h2 className="mt-2 text-xl font-bold">{signal.name}</h2>
                <div className="mt-5 flex items-center justify-between">
                  <span className={`rounded-lg border px-3 py-2 text-sm ${getStatusColor(signal.status)}`}>
                    {signal.status.toUpperCase()}
                  </span>
                  <b>{Math.round(signal.traffic_load)}% load</b>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-cyan" style={{ width: `${signal.traffic_load}%` }} />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}
