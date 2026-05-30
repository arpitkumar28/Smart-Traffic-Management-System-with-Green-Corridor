"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, BatteryCharging, Bell, Bolt, CloudRain, HeartPulse, Layers, MapPin, ShieldCheck, Signal, Sparkles, UserCircle2, Wifi, RotateCw } from "lucide-react";
import { Card } from "@/components/ui";
import { CommandCenterCharts } from "@/components/command-center/CommandCenterCharts";
import { CommandCenterMap } from "@/components/command-center/CommandCenterMap";
import { fetchDashboardMetrics, fetchAlerts, fetchEvents, retryRequest, type DashboardMetrics, type Alert, type TrafficEvent } from "@/lib/api";
import {
  aiDecisions,
  commandCenterBrand,
  emergencyStatus,
  impactMetrics,
  intelligenceAlerts,
  networkStatus,
  riskLevels,
  roadClosures,
  timelineEvents,
  trafficHealth,
  weatherAlerts,
  wireFeed,
} from "@/lib/commandCenterData";

const statusTone = {
  lime: "bg-lime/15 text-lime border-lime/30",
  cyan: "bg-cyan/15 text-cyan border-cyan/30",
  amber: "bg-amber/15 text-amber-300 border-amber-300/25",
};

export default function CommandCenterPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [dashData, alertsData, eventsData] = await Promise.all([
          retryRequest(() => fetchDashboardMetrics()),
          retryRequest(() => fetchAlerts()),
          retryRequest(() => fetchEvents()),
        ]);
        setMetrics(dashData);
        setAlerts(alertsData.slice(0, 5));
        setEvents(eventsData.slice(0, 8));
      } catch (err) {
        console.error("Failed to load command center data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getLiveStatus = () => metrics ? "Optimal" : "Loading...";
  const getActiveEmergencies = () => events && events.length > 0 ? events.filter(e => e?.event?.toLowerCase?.().includes("emergency") || false).length : 0;

  return (
    <div className="min-h-screen bg-citygrid map-grid px-6 py-6 text-slate-100 sm:px-8 lg:px-10 xl:px-14">
      <div className="mx-auto max-w-[1780px] space-y-6">
        <header className="grid gap-6 xl:grid-cols-[1.1fr_auto] xl:items-center">
          <div className="rounded-[32px] border border-white/10 bg-[#09131b]/95 p-8 shadow-[0_0_60px_rgba(24,242,255,0.08)] backdrop-blur-[20px]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.32em] text-white/70 shadow-[0_0_24px_rgba(140,255,90,0.06)]">
                  <Sparkles size={16} /> GreenFlow AI
                </div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Smart City Command Center</h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Monitor citywide traffic, wire intelligence, emergency corridors and predictive AI decisions from a high-performance desktop operations hub.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-3xl border border-white/10 bg-[#061014]/95 p-4 shadow-[0_0_20px_rgba(24,242,255,0.06)]">
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">Live city status</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{getLiveStatus()}</p>
                  <p className="mt-2 text-sm text-slate-400">Real-time signal optimization and emergency readiness.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-[#061014]/95 p-4 shadow-[0_0_20px_rgba(140,255,90,0.06)]">
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">Operator</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan/10 text-cyan shadow-neon">
                      <UserCircle2 size={28} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">{commandCenterBrand.operator.name}</p>
                      <p className="text-sm text-slate-400">{commandCenterBrand.operator.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:max-w-[360px]">
            <Card className="space-y-4 rounded-[28px] border border-white/10 bg-[#061016]/95 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">Command Status</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Live overview</h2>
                </div>
                <Bell className="text-cyan" />
              </div>
              <div className="grid gap-3">
                <StatusCard label="Active emergencies" value={`${getActiveEmergencies()}`} tone="lime" icon={<AlertTriangle size={16} />} />
                <StatusCard label="Active alerts" value={`${alerts.length}`} tone="cyan" icon={<Wifi size={16} />} />
                <StatusCard label="System health" value={metrics ? "98%" : ".."} tone="lime" icon={<Bolt size={16} />} />
              </div>
            </Card>
            <Card className="rounded-[28px] border border-white/10 bg-[#061016]/95 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">City pulse</p>
              <div className="mt-5 space-y-4">
                <Metric label="Network flow" value={metrics ? `${metrics.trafficFlow}%` : ".."} />
                <Metric label="Avg wait time" value={metrics ? `${metrics.avgWait}s` : ".."} />
                <Metric label="Vehicles/min" value={metrics ? `${metrics.vehiclesPerMinute}` : ".."} />
              </div>
            </Card>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[300px_minmax(620px,1fr)_360px]">
          <aside className="space-y-6">
            <Card className="rounded-[28px] border border-white/10 bg-[#061016]/95 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">AI Decision Center</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Current actions</h2>
                </div>
                <Sparkles className="text-cyan" />
              </div>
              <div className="space-y-4">
                {aiDecisions.map((decision) => (
                  <div key={decision.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{decision.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{decision.description}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusTone[decision.tone]}`}>{decision.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[28px] border border-white/10 bg-[#061016]/95 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">Traffic Health</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Performance metrics</h2>
                </div>
                <HeartPulse className="text-amber-300" />
              </div>
              <div className="space-y-4">
                {trafficHealth.map((item) => (
                  <ProgressRow key={item.label} label={item.label} value={item.value} detail={item.detail} tone={item.tone} />
                ))}
              </div>
            </Card>

            <Card className="rounded-[28px] border border-white/10 bg-[#061016]/95 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">Network Status</p>
              <div className="mt-5 space-y-3">
                <StatusLine label="Throughput" value={networkStatus.throughput} />
                <StatusLine label="Packet loss" value={networkStatus.packetLoss} />
                <StatusLine label="Latency" value={networkStatus.latency} />
                <StatusLine label="Nodes online" value={`${networkStatus.nodesOnline}`} />
              </div>
            </Card>

            <Card className="rounded-[28px] border border-white/10 bg-[#061016]/95 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">Emergency Response</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Status summary</h2>
                </div>
                <ShieldCheck className="text-lime" />
              </div>
              <div className="space-y-4">
                {emergencyStatus.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </div>
                ))}
              </div>
            </Card>
          </aside>

          <section className="space-y-6">
            <Card className="rounded-[32px] border border-white/10 bg-[#061016]/95 p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">City map</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Live operations map</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80">
                  <MapPin size={16} /> OpenStreetMap
                </div>
              </div>
              <div className="h-[660px] rounded-[28px] border border-white/10 bg-[#07131a]/90 p-2">
                <CommandCenterMap />
              </div>
            </Card>
          </section>

          <aside className="space-y-6">
            <Card className="rounded-[28px] border border-white/10 bg-[#061016]/95 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">Anakin Wire Intelligence</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Feed</h2>
                </div>
                <Layers className="text-cyan" />
              </div>
              <div className="space-y-4">
                {wireFeed.map((item) => (
                  <div key={item.time} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{item.level}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.time}</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{item.headline}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[28px] border border-white/10 bg-[#061016]/95 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">Road closures</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Active alerts</h2>
                </div>
                <AlertTriangle className="text-amber-300" />
              </div>
              <div className="space-y-3">
                {roadClosures.map((closure) => (
                  <div key={closure.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold text-white">{closure.label}</p>
                    <p className="mt-1 text-sm text-slate-400">{closure.note}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[28px] border border-white/10 bg-[#061016]/95 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">Weather alerts</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Environmental watch</h2>
                </div>
                <CloudRain className="text-cyan" />
              </div>
              <div className="space-y-3">
                {weatherAlerts.map((alert) => (
                  <div key={alert.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold text-white">{alert.condition}</p>
                    <p className="mt-1 text-sm text-slate-400">{alert.impact}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[28px] border border-white/10 bg-[#061016]/95 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">Emergency intelligence</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Risk levels</h2>
                </div>
                <Signal className="text-lime" />
              </div>
              <div className="space-y-3">
                {intelligenceAlerts.map((alert) => (
                  <div key={alert.label} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-200">{alert.label}</p>
                    <p className="font-semibold text-white">{alert.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[28px] border border-white/10 bg-[#061016]/95 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">Risk levels</p>
              <div className="mt-5 space-y-4">
                {riskLevels.map((risk) => (
                  <div key={risk.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{risk.category}</span>
                      <span>{risk.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div className={`${risk.tone} h-2 rounded-full`} style={{ width: `${risk.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="rounded-[32px] border border-white/10 bg-[#061016]/95 p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">Live event timeline</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Operations feed</h2>
              </div>
              <div className="rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.32em] text-slate-300">Realtime</div>
            </div>
            <div className="space-y-4">
              {timelineEvents.map((item) => (
                <div key={item.time} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm uppercase tracking-[0.28em] text-cyan/60">{item.time}</p>
                    <span className="rounded-full bg-lime/10 px-3 py-1 text-xs text-lime">Update</span>
                  </div>
                  <p className="mt-3 text-base leading-7 text-slate-200">{item.event}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[28px] border border-white/10 bg-[#061016]/95 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">Impact metrics</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">System outcomes</h2>
                </div>
                <BatteryCharging className="text-lime" />
              </div>
              <div className="grid gap-4">
                {impactMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">{metric.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[28px] border border-white/10 bg-[#061016]/95 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan/60">Analytics charts</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Performance engine</h2>
                </div>
                <BarChart3 className="text-cyan" />
              </div>
              <CommandCenterCharts />
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusCard({ label, value, tone, icon }: { label: string; value: string; tone: keyof typeof statusTone; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-cyan shadow-neon">{icon}</span>
        <div className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] ${statusTone[tone]}`}>{label}</div>
      </div>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ProgressRow({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: keyof typeof statusTone }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
        <div className={`${statusTone[tone]} h-2 rounded-full`} style={{ width: value }} />
      </div>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
      <span>{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
