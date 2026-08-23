"use client";

import { useState } from "react";
import { Ambulance, Route, Send } from "lucide-react";
import { Shell } from "@/components/Shell";
import { MetricCard, PageHeader, Panel, StatusBadge } from "@/components/operations";
import { handleApiError, triggerEmergencyCorridor } from "@/lib/api";
import useRealtime from "@/hooks/useRealtime";

const intersections = ["J01 · Malviya Nagar", "J02 · Panch Batti", "J03 · Ajmer Road", "J04 · SMS Hospital Road", "J05 · SMS Hospital"];

export default function GreenCorridorsPage() {
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [phase, setPhase] = useState<"PREPARE" | "REVIEW" | "CONFIRM" | "EXECUTE" | "CONFIRMED">("PREPARE");
  const [message, setMessage] = useState("No live corridor is confirmed. Review the preflight before requesting activation.");
  const { status: realtimeStatus } = useRealtime((type, payload) => {
    if (type !== "corridor.activated") return;
    const update = payload as { ambulance?: string; vehicleId?: string };
    if (update.ambulance === "AMB-007" || update.vehicleId === "AMB-007") {
      setActive(true);
      setPhase("CONFIRMED");
      setMessage("COMMAND CONFIRMED by WebSocket update.");
    }
  });

  async function activate() {
    setConfirmOpen(false);
    setBusy(true);
    setPhase("EXECUTE");
    setMessage("COMMAND REQUESTED - waiting for backend confirmation.");
    try {
      const response = await triggerEmergencyCorridor("AMB-007", "SMS Hospital, Jaipur");
      if (response.status?.toLowerCase().includes("activated")) {
        setActive(true);
        setPhase("CONFIRMED");
        setMessage(`COMMAND CONFIRMED by the live API${response.signalsOptimized ? ` with ${response.signalsOptimized} optimized signals` : ""}.`);
      } else {
        setPhase("REVIEW");
        setMessage("COMMAND STATUS UNKNOWN: the backend did not confirm activation.");
      }
    } catch (error) {
      setActive(false);
      setPhase("REVIEW");
      setMessage(`COMMAND NOT CONFIRMED: ${handleApiError(error).message}. Retry or return to review.`);
    } finally {
      setBusy(false);
    }
  }

  return <Shell>
    <main className="ops-page">
      <PageHeader index="04" title="Green corridors" subtitle="Multi-intersection priority routes for any authorized traffic operation" actions={<button className="ops-button" disabled={busy} onClick={() => { setPhase("REVIEW"); setConfirmOpen(true); }}><Send size={13}/>{busy ? "Activating…" : "Review command"}</button>}/>
      <div className="ops-grid"><MetricCard label="Active corridors" value={active ? 1 : 0} note="Only confirmed backend state"/><MetricCard label="Intersections in route" value="5" note="GC-007 coordinated plan"/><MetricCard label="Current route state" value={active ? "Confirmed" : "Standby"} tone={active ? "green" : "plain"} note="Adaptive traffic control"/><MetricCard label="Priority class" value="Authorized" tone="plain" note="Emergency is one use case"/></div>
      <div className="ops-layout">
        <Panel title="GREEN CORRIDOR PREFLIGHT" subtitle="Review before requesting coordinated signal operation">
          <div className="ops-callout"><b>Phase:</b> {phase}<br/><b>Realtime:</b> {realtimeStatus}<br/><b>Vehicle:</b> Emergency Unit AMB-007<br/><b>Destination:</b> SMS Hospital, Jaipur<br/><b>Route:</b> J01 → J02 → J03 → J04 → J05<br/><b>Affected intersections:</b> 5<br/><b>Action:</b> Coordinate selected intersections<br/><br/>{message}</div>
          <ol className="corridor-timeline" style={{marginTop:14}}>{intersections.map((node,index)=><li key={node} className={!active && index > 0 ? "pending" : ""}><b>{node.split(" · ")[0]}</b><span>{node.split(" · ")[1]}</span><em>{active ? "Confirmed" : "Standby"}</em></li>)}</ol>
          <button className="ops-button danger" style={{marginTop:12}} disabled title="The backend does not expose a corridor termination endpoint.">End corridor unavailable</button>
        </Panel>
        <Panel title="Route context" subtitle="Connected junction sequence">
          <div className="route-map route-map-compact"><div className="map-grid"/><svg viewBox="0 0 300 180"><path className="route-glow" d="M38 37 L84 65 L133 48 L176 91 L224 111 L259 145"/>{[[38,37],[84,65],[133,48],[176,91],[224,111],[259,145]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="7"/><circle className="node-core" cx={x} cy={y} r="3"/></g>)}</svg></div>
          <div className="ops-list" style={{marginTop:12}}><div className="ops-list-item"><div><h3><Ambulance size={14}/> Priority vehicle integration</h3><p>Uses the existing emergency corridor API when a priority vehicle is authorized.</p></div><StatusBadge tone="amber">Review required</StatusBadge></div><div className="ops-list-item"><div><h3><Route size={14}/> General orchestration</h3><p>The same corridor planner can prioritize approved public-safety, transit, or incident response operations.</p></div><StatusBadge>Connected</StatusBadge></div></div>
        </Panel>
      </div>
      {confirmOpen && <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-corridor-title"><div className="confirm-dialog"><h2 id="confirm-corridor-title">Confirm green corridor</h2><p>This command will request coordinated signal operation across J01, J02, J03, J04, and J05.</p><p><b>System mode:</b> Live status is shown in the shared header.<br/><b>Operator:</b> Current session operator</p><div className="confirm-actions"><button className="outline-button" onClick={() => setConfirmOpen(false)}>Cancel</button><button className="danger-button" onClick={activate}>Confirm command</button></div></div></div>}
    </main>
  </Shell>;
}
