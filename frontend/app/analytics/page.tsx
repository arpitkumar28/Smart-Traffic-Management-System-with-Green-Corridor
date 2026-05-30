"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui";
import { fetchAnalytics, retryRequest, type AnalyticsData } from "@/lib/api";

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
        // Handle both array and object responses
        const analyticsArray = Array.isArray(data) ? data : data?.analytics || [];
        setAnalyticsData(analyticsArray.slice(0, 7));
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const peakValue = analyticsData.length > 0 ? Math.max(...analyticsData.map(d => d.value)) : 0;
  const avgValue = analyticsData.length > 0 ? Math.round(analyticsData.reduce((a, d) => a + d.value, 0) / analyticsData.length) : 0;

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6 py-6">
        <h1 className="text-4xl font-black">Analytics</h1>
        
        {error && (
          <div className="rounded-lg border border-ember/30 bg-ember/10 p-4 flex items-center gap-3">
            <AlertCircle className="text-ember" size={18} />
            <p className="text-sm text-white/70">{error}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-white/55">Peak Value</p>
            {loading ? (
              <div className="mt-3 h-10 w-20 rounded bg-white/10 animate-pulse" />
            ) : (
              <b className="mt-3 block text-4xl text-cyan">{peakValue}</b>
            )}
          </Card>
          <Card>
            <p className="text-white/55">Average Metric</p>
            {loading ? (
              <div className="mt-3 h-10 w-20 rounded bg-white/10 animate-pulse" />
            ) : (
              <b className="mt-3 block text-4xl text-lime">{avgValue}</b>
            )}
          </Card>
          <Card>
            <p className="text-white/55">Data Points</p>
            {loading ? (
              <div className="mt-3 h-10 w-20 rounded bg-white/10 animate-pulse" />
            ) : (
              <b className="mt-3 block text-4xl text-lime">{analyticsData.length}</b>
            )}
          </Card>
        </div>
        
        <Card>
          <h2 className="mb-4 text-xl font-bold">Analytics Report</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RotateCw className="animate-spin text-cyan" size={24} />
            </div>
          ) : analyticsData.length === 0 ? (
            <p className="text-white/50">No analytics data available</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-7">
              {analyticsData.map((item) => (
                <div key={item.metric} className="rounded-lg bg-white/5 p-4">
                  <p className="text-sm text-white/50 truncate">{item.metric}</p>
                  <p className="mt-2 text-2xl font-black text-cyan">{item.value}</p>
                  {item.timestamp && <p className="mt-1 text-xs text-white/40">{new Date(item.timestamp).toLocaleTimeString()}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
