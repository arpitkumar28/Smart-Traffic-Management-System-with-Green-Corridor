"use client";

import { useState } from "react";
import { Ambulance, Route, Send } from "lucide-react";
import { Shell } from "@/components/Shell";
import { MetricCard, PageHeader, Panel, StatusBadge } from "@/components/operations";
import { executeEmergencyDemo, handleApiError, prepareEmergencyDemo, resetEmergencyDemo, type EmergencyCorridorDemo } from "@/lib/api";
import useRealtime from "@/hooks/useRealtime";

const intersections = ["J01 · Malviya Nagar", "J02 · Panch Batti", "J03 · Ajmer Road", "J04 · SMS Hospital Road", "J05 · SMS Hospital"];

export default function GreenCorridorsPage() {
  const [demo, setDemo] = useState<EmergencyCorridorDemo | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [phase, setPhase] = useState<"PREPARE" | "REVIEW" | "CONFIRM" | "EXECUTE" | "CONFIRMED">("PREPARE");
  const [message, setMessage] = useState("No live corridor is confirmed. Review the preflight before requesting activation.");
  const { status: realtimeStatus } = useRealtime((type, payload) => {
    if (type !== "corridor.prepared" && type !== "corridor.activated" && type !== "corridor.confirmed") return;
    const update = payload as EmergencyCorridorDemo;
    if (update.scenario !== "EMERGENCY_CORRIDOR_DEMO") return;
    setDemo(update);
    if (type === "corridor.prepared") { setPhase("REVIEW"); setMessage("GREEN CORRIDOR PREPARED by backend."); }
    if (type === "corridor.activated") { setPhase("EXECUTE"); setMessage("SIMULATION COMMAND SENT."); }
    if (type === "corridor.confirmed") { setPhase("CONFIRMED"); setMessage("SIMULATED CORRIDOR CONFIRMED by WebSocket."); }
  });

  async function activate() {
    setConfirmOpen(false);
    setBusy(true);
    setPhase("EXECUTE");
    setMessage("SIMULATION COMMAND SENT - waiting for backend confirmation.");
    try {
      const response = await executeEmergencyDemo();
      if (response.status === "CONFIRMED") {
        setDemo(response);
        setPhase("CONFIRMED");
        setMessage("SIMULATED CORRIDOR CONFIRMED by the backend.");
      } else {
        setPhase("REVIEW");
        setMessage("COMMAND STATUS UNKNOWN: the backend did not confirm activation.");
      }
    } catch (error) {
      setDemo(null);
      setPhase("REVIEW");
      setMessage(`COMMAND NOT CONFIRMED: ${handleApiError(error).message}. Retry or return to review.`);
    } finally {
      setBusy(false);
    }
  }

  async function prepare() {
    setBusy(true);
    try {
      const response = await prepareEmergencyDemo();
      setDemo(response);
      setPhase("REVIEW");
      setMessage("GREEN CORRIDOR PREPARED. Review before confirmation.");
    } catch (error) {
      setMessage(`COMMAND NOT CONFIRMED: ${handleApiError(error).message}`);
    } finally { setBusy(false); }
  }

  async function reset() {
    setBusy(true);
    try {
      const response = await resetEmergencyDemo();
      setDemo(response);
      setPhase("PREPARE");
      setMessage("Demo reset to its deterministic initial state.");
    } finally { setBusy(false); }
  }

  return <Shell>
    <main className="ops-page">
      <PageHeader index="04" title="Green corridors" subtitle="Simulation-only coordinated response across five virtual IoT nodes" actions={<><button className="ops-button" disabled={busy} onClick={prepare}><Send size={13}/>Prepare demo</button><button className="ops-button" disabled={busy || !demo || demo.status !== "PREPARED"} onClick={() => { setPhase("CONFIRM"); setConfirmOpen(true); }}>Review command</button></>}/>
      <div className="ops-grid"><MetricCard label="Active corridors" value={demo?.status === "CONFIRMED" ? 1 : 0} note="Only confirmed backend state"/><MetricCard label="Intersections in route" value="5" note="GF-J01 to GF-J05"/><MetricCard label="Current route state" value={demo?.status ?? "IDLE"} tone={demo?.status === "CONFIRMED" ? "green" : "plain"} note="Simulation workflow"/><MetricCard label="System" value="SIMULATION" tone="plain" note="Virtual IoT only"/></div>
      <div className="ops-layout">
        <Panel title="GREEN CORRIDOR PREFLIGHT" subtitle="Review before requesting coordinated signal operation">
          <div className="ops-callout"><b>Phase:</b> {phase}<br/><b>Realtime:</b> {realtimeStatus}<br/><b>Vehicle:</b> SIM-EMERGENCY-01 <span className="demo-label">SIMULATION VEHICLE</span><br/><b>Destination:</b> Simulation Hospital<br/><b>Route:</b> J01 → J02 → J03 → J04 → J05<br/><b>Affected nodes:</b> 5<br/><b>System:</b> SIMULATION<br/><b>Action:</b> Simulate coordinated signal response<br/><br/>{message}</div>
          <ol className="corridor-timeline" style={{marginTop:14}}>{intersections.map((node,index)=><li key={node} className={demo?.status !== "CONFIRMED" && index > 0 ? "pending" : ""}><b>{node.split(" · ")[0]}</b><span>{node.split(" · ")[1]}</span><em>{demo?.status === "CONFIRMED" ? "Confirmed" : "Standby"}</em></li>)}</ol>
          <button className="ops-button" style={{marginTop:12}} disabled={busy} onClick={reset}>Reset demo</button>
        </Panel>
        <Panel title="Route context" subtitle="Connected junction sequence">
          <div className="route-map route-map-compact"><div className="map-grid"/><svg viewBox="0 0 300 180"><path className="route-glow" d="M38 37 L84 65 L133 48 L176 91 L224 111 L259 145"/>{[[38,37],[84,65],[133,48],[176,91],[224,111],[259,145]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="7"/><circle className="node-core" cx={x} cy={y} r="3"/></g>)}</svg></div>
          <div className="ops-list" style={{marginTop:12}}><div className="ops-list-item"><div><h3><Ambulance size={14}/> Priority vehicle integration</h3><p>Uses the existing emergency corridor API when a priority vehicle is authorized.</p></div><StatusBadge tone="amber">Review required</StatusBadge></div><div className="ops-list-item"><div><h3><Route size={14}/> General orchestration</h3><p>The same corridor planner can prioritize approved public-safety, transit, or incident response operations.</p></div><StatusBadge>Connected</StatusBadge></div></div>
        </Panel>
      </div>
      {confirmOpen && <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-corridor-title"><div className="confirm-dialog"><h2 id="confirm-corridor-title">Confirm simulation</h2><p>This command will request a simulated coordinated signal response across J01, J02, J03, J04, and J05.</p><p><b>System mode:</b> SIMULATION<br/><b>Vehicle:</b> SIM-EMERGENCY-01<br/><b>Operator:</b> Current session operator</p><div className="confirm-actions"><button className="outline-button" onClick={() => setConfirmOpen(false)}>Cancel</button><button className="danger-button" onClick={activate}>Confirm simulation</button></div></div></div>}
    </main>
  </Shell>;
}
