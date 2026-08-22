"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleDot, Clock3, Network, RefreshCw, Route, SlidersHorizontal } from "lucide-react";
import { Shell } from "@/components/Shell";
import { MetricCard, PageHeader, Panel, StatusBadge } from "@/components/operations";
import useRealtime from "@/hooks/useRealtime";
import { fetchSignals, updateSignalState, type Signal } from "@/lib/api";

const SignalNetworkMap = dynamic(() => import("@/components/SignalNetworkMap").then((module) => module.SignalNetworkMap), { ssr: false, loading: () => <div className="ops-empty">Loading network map…</div> });
type EventItem = { id: number; text: string; at: string; tone: "green" | "amber" | "red" };

function phaseTone(status: string): "green" | "amber" | "red" { return status === "red" ? "red" : status === "yellow" ? "amber" : "green"; }
function phaseLabel(status: string) { return status === "priority" || status === "green_corridor" ? "Priority green" : status; }

export default function SignalSyncPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [apiState, setApiState] = useState<"loading" | "live" | "offline">("loading");
  const [socketState, setSocketState] = useState<"connecting" | "live" | "offline">("connecting");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [override, setOverride] = useState("green");
  const [busy, setBusy] = useState<"override" | "corridor" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const appendEvent = useCallback((text: string, tone: EventItem["tone"] = "green") => {
    setEvents((current) => [{ id: Date.now(), text, at: new Date().toLocaleTimeString(), tone }, ...current].slice(0, 8));
  }, []);

  const loadSignals = useCallback(async () => {
    setApiState("loading"); setError(null);
    try {
      const data = await fetchSignals();
      setSignals(data); setSelectedId((current) => current && data.some((signal) => signal.id === current) ? current : data[0]?.id ?? null);
      setApiState("live"); appendEvent(`Signal inventory refreshed (${data.length} nodes reported).`);
    } catch (requestError) {
      setApiState("offline"); setError(requestError instanceof Error ? requestError.message : "Signal API unavailable.");
    }
  }, [appendEvent]);

  useEffect(() => { loadSignals(); }, [loadSignals]);

  useRealtime((type, payload) => {
    if (type !== "signal.update") return;
    const update = payload as { signals?: Signal[] } | Signal[];
    const nextSignals = Array.isArray(update) ? update : update.signals;
    if (!Array.isArray(nextSignals)) return;
    setSignals(nextSignals); setSelectedId((current) => current && nextSignals.some((signal) => signal.id === current) ? current : nextSignals[0]?.id ?? null);
    setSocketState("live"); appendEvent(`SIGNAL_UPDATE received for ${nextSignals.length} node${nextSignals.length === 1 ? "" : "s"}.`);
  }, () => setSocketState("offline"), () => setSocketState("offline"));

  const selected = useMemo(() => signals.find((signal) => signal.id === selectedId) ?? null, [signals, selectedId]);
  const onlinePhases = signals.filter((signal) => ["green", "yellow", "red", "priority", "green_corridor"].includes(signal.status)).length;
  const averageLoad = signals.length ? Math.round(signals.reduce((total, signal) => total + signal.traffic_load, 0) / signals.length) : 0;

  async function setSignalState(signal: Signal, status: string, kind: "override" | "corridor") {
    if (apiState !== "live") return;
    setBusy(kind); setError(null);
    try {
      const updated = await updateSignalState(signal.id, status);
      if ("error" in updated) throw new Error(String((updated as unknown as { error: string }).error));
      setSignals((current) => current.map((item) => item.id === signal.id ? updated : item));
      appendEvent(`${signal.id} changed to ${phaseLabel(status)} through the signal API.`, "amber");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Signal update failed."); }
    finally { setBusy(null); }
  }

  async function synchronizeCorridor() {
    if (apiState !== "live" || !signals.length) return;
    setBusy("corridor"); setError(null);
    try {
      const results = await Promise.all(signals.map((signal) => updateSignalState(signal.id, "green_corridor")));
      if (results.some((result) => "error" in result)) throw new Error("One or more signals rejected the corridor synchronization request.");
      setSignals(results); appendEvent(`Corridor synchronization sent to ${results.length} signal nodes.`, "amber");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Corridor synchronization failed."); }
    finally { setBusy(null); }
  }

  return <Shell><main className="ops-page">
    <PageHeader index="05" title="Signal synchronization" subtitle="IoT traffic signal coordination, phase monitoring, and authorized operator control" actions={<button className="ops-button" onClick={loadSignals} disabled={apiState === "loading"}><RefreshCw size={13}/>{apiState === "loading" ? "Loading…" : "Refresh signals"}</button>}/>
    <div className="ops-grid"><MetricCard label="Signal nodes reported" value={signals.length} note={apiState === "live" ? "LIVE · FastAPI signal inventory" : apiState === "offline" ? "OFFLINE · API unavailable" : "Loading API inventory"} tone={apiState === "offline" ? "red" : "green"}/><MetricCard label="Reported phases" value={onlinePhases} note="Phase state supplied by API"/><MetricCard label="Average traffic load" value={signals.length ? `${averageLoad}%` : "—"} note="From active signal response" tone={averageLoad > 70 ? "amber" : "green"}/><MetricCard label="Realtime channel" value={socketState === "live" ? "LIVE" : socketState === "offline" ? "OFFLINE" : "CONNECTING"} note="Normalized SIGNAL_UPDATE events" tone={socketState === "offline" ? "red" : socketState === "live" ? "green" : "plain"}/></div>
    {error && <div className="command-notice" role="alert"><CircleDot size={14}/>{error}</div>}
    <div className="signal-sync-grid">
      <Panel title="Connected signal nodes" subtitle="Node availability is based on the signal API response"><div className={`socket-state ${socketState === "live" ? "live" : socketState === "offline" ? "offline" : ""}`}><i/> {socketState === "live" ? "LIVE signal feed" : socketState === "offline" ? "OFFLINE realtime channel" : "Connecting realtime channel"}</div><div className="signal-node-list" style={{marginTop:10}}>{signals.length ? signals.map((signal) => <button className={`signal-node ${selectedId === signal.id ? "selected" : ""}`} key={signal.id} onClick={() => setSelectedId(signal.id)}><strong>{signal.id}</strong><p>{signal.name}</p><div className="signal-node-footer"><StatusBadge tone={phaseTone(signal.status)}>{phaseLabel(signal.status)}</StatusBadge><span className="demo-label">{Math.round(signal.traffic_load)}% load</span></div></button>) : <div className="ops-empty">{apiState === "loading" ? "Loading signal nodes…" : "OFFLINE · No nodes returned by the backend."}</div>}</div></Panel>
      <Panel title="Signal network map" subtitle="Leaflet map uses only coordinates returned by the signal API"><SignalNetworkMap signals={signals} selectedId={selectedId} onSelect={setSelectedId}/><div className="corridor-control"><div className="ops-callout"><b><Route size={13}/> Corridor synchronization.</b> Sends the existing signal-state API command to all currently reported nodes. It is unavailable while the API is offline.</div><button className="ops-button" disabled={apiState !== "live" || busy !== null || !signals.length} onClick={synchronizeCorridor}>{busy === "corridor" ? "Synchronizing…" : "Synchronize reported corridor nodes"}</button></div></Panel>
      <Panel title="Selected intersection" subtitle={selected ? `${selected.id} · ${selected.name}` : "Select a signal node"}>{selected ? <div className="signal-detail"><div className="phase-display"><div><small>Live phase</small><strong className={phaseTone(selected.status)}>{phaseLabel(selected.status)}</strong></div><div><small>Remaining phase time</small><strong>Not reported</strong></div></div><div className="signal-detail-row"><span>Synchronization status</span><b>{selected.status === "green_corridor" || selected.status === "priority" ? "Priority state" : "API-reported phase"}</b></div><div className="signal-detail-row"><span>Communication latency</span><b>Not reported</b></div><div className="signal-detail-row"><span>Signal health</span><b>{apiState === "live" ? "API reachable" : "Not available"}</b></div><div className="signal-detail-row"><span>Coordinates</span><b>{selected.lat || selected.lng ? `${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}` : "Not reported"}</b></div><label className="demo-label">Manual override phase<select value={override} onChange={(event) => setOverride(event.target.value)} disabled={apiState !== "live" || busy !== null} style={{display:"block",width:"100%",marginTop:5,padding:8,color:"#effaf3",border:"1px solid rgba(90,180,135,.25)",borderRadius:4,background:"#062017"}}><option value="green">Green</option><option value="yellow">Yellow</option><option value="red">Red</option></select></label><button className="ops-button" disabled={apiState !== "live" || busy !== null} onClick={() => setSignalState(selected, override, "override")}><SlidersHorizontal size={13}/>{busy === "override" ? "Applying…" : "Apply manual override"}</button></div> : <div className="ops-empty">No signal is selected.</div>}</Panel>
    </div>
    <Panel title="Recent signal events" subtitle="API and normalized realtime activity in this browser session" className="overflow" ><div className="event-log">{events.length ? events.map((event) => <div className="event-log-item" key={event.id} style={{borderLeftColor:event.tone === "red" ? "#e95b5b" : event.tone === "amber" ? "#d7a93e" : "#31d77b"}}><b>{event.text}</b><span><Clock3 size={10}/> {event.at}</span></div>) : <div className="ops-empty"><Network size={15}/> Awaiting signal API or SIGNAL_UPDATE events.</div>}</div></Panel>
  </main></Shell>;
}
