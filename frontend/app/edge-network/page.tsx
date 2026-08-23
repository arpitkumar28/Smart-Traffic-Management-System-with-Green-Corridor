"use client";

import { useEffect, useState } from "react";
import { Cpu, RefreshCw, Wifi } from "lucide-react";
import dynamic from "next/dynamic";
import { Shell } from "@/components/Shell";
import { MetricCard, PageHeader, Panel, StatusBadge } from "@/components/operations";
import useRealtime from "@/hooks/useRealtime";
import { fetchIoTNetwork, prepareEmergencyDemo, resetEmergencyDemo, resetIoTSimulation, setIoTScenario, type IoTNode } from "@/lib/api";
import type { Signal } from "@/lib/api";

const SignalNetworkMap = dynamic(() => import("@/components/SignalNetworkMap").then((module) => module.SignalNetworkMap), { ssr: false, loading: () => <div className="ops-empty">Loading simulation map...</div> });

const scenarios = [["NORMAL", "Normal traffic"], ["CONGESTION", "High congestion"], ["EMERGENCY", "Emergency"], ["NODE_OFFLINE", "Node offline"]] as const;
const toneFor = (status: IoTNode["status"]): "green" | "amber" | "red" => status === "ONLINE" ? "green" : status === "OFFLINE" ? "red" : "amber";

export default function EdgeNetworkPage() {
  const [nodes, setNodes] = useState<IoTNode[]>([]);
  const [scenario, setScenario] = useState("NORMAL");
  const [selectedId, setSelectedId] = useState("GF-J03");
  const [busy, setBusy] = useState(false);
  const [demoStatus, setDemoStatus] = useState("IDLE");
  const { status: realtimeStatus } = useRealtime((type, payload) => {
    if (type === "corridor.confirmed") setDemoStatus("CONFIRMED");
    if (type !== "iot.node.update" || typeof payload !== "object" || payload === null) return;
    const update = payload as Partial<IoTNode> & { nodeId?: string };
    if (!update.nodeId) return;
    setNodes((current) => current.map((node) => node.nodeId === update.nodeId ? { ...node, ...update } as IoTNode : node));
    if (update.coordinationStatus === "COORDINATION_ACTIVE") setDemoStatus("EXECUTING");
  });

  useEffect(() => { fetchIoTNetwork().then((data) => { setNodes(data.nodes); setScenario(data.scenario); }).catch(() => undefined); }, []);

  async function runScenario(nextScenario: string) {
    setBusy(true);
    try { const data = await setIoTScenario(nextScenario); setNodes(data.nodes); setScenario(data.scenario); } finally { setBusy(false); }
  }
  async function reset() {
    setBusy(true);
    try { const data = await resetIoTSimulation(); setNodes(data.nodes); setScenario(data.scenario); } finally { setBusy(false); }
  }

  async function startEmergencyDemo() {
    setBusy(true);
    try { const data = await prepareEmergencyDemo(); setNodes(data.nodes); setScenario(data.scenario); setDemoStatus(data.status); } finally { setBusy(false); }
  }

  async function resetDemo() {
    setBusy(true);
    try { const data = await resetEmergencyDemo(); setNodes(data.nodes); setScenario(data.scenario); setDemoStatus(data.status); } finally { setBusy(false); }
  }

  const selected = nodes.find((node) => node.nodeId === selectedId) ?? nodes[0];
  const online = nodes.filter((node) => node.status === "ONLINE").length;
  const warnings = nodes.filter((node) => node.status === "WARNING").length;
  const mapSignals: Signal[] = nodes.map((node) => ({ id: node.nodeId, name: node.intersectionId, status: node.signalState.toLowerCase(), traffic_load: node.vehicleCount, lat: node.latitude, lng: node.longitude }));
  const routeCoords: [number, number][] = nodes.map((node) => [node.latitude, node.longitude]);

  return <Shell><main className="ops-page">
    <PageHeader index="07" title="IoT Traffic Network" subtitle="Five virtual roadside nodes with deterministic simulation telemetry" actions={<button className="ops-button" onClick={() => window.location.reload()}><RefreshCw size={13} /> Refresh telemetry</button>} />
    <div className="ops-callout"><strong>VIRTUAL IoT NETWORK</strong> <span>SIMULATION ONLY · No physical hardware connected.</span></div>
    <div className="ops-grid"><MetricCard label="Virtual nodes" value={nodes.length} note="5 simulated" /><MetricCard label="Availability" value={`${online}/${nodes.length}`} note="Simulation connectivity" /><MetricCard label="Warnings" value={warnings} tone="amber" note={`Scenario: ${scenario}`} /><MetricCard label="Realtime" value={realtimeStatus} tone={realtimeStatus === "LIVE" ? "green" : "amber"} note="Central WebSocket" /></div>
    <Panel title="Emergency corridor demonstration" subtitle="Backend-controlled deterministic scenario: GF-J03 high congestion, then coordinated response."><div className="ops-button-row"><button className="ops-button" disabled={busy} onClick={startEmergencyDemo}>Start emergency demo</button><button className="ops-button" disabled={busy} onClick={resetDemo}>Reset demo</button><span className="demo-label">{demoStatus}</span></div></Panel>
    <Panel title="Simulation controls" subtitle="Every action updates backend-owned node state and broadcasts telemetry."><div className="ops-button-row">{scenarios.map(([value, label]) => <button key={value} className="ops-button" disabled={busy} onClick={() => runScenario(value)}>{label}</button>)}<button className="ops-button" disabled={busy} onClick={reset}>Reset simulation</button></div></Panel>
    <Panel title="SIMULATION MAP" subtitle="Virtual coordinates show the five-node route; they do not represent deployed intersections."><SignalNetworkMap signals={mapSignals} selectedId={selectedId} onSelect={setSelectedId} routeCoords={routeCoords} simulationActive={demoStatus === "PREPARED" || demoStatus === "EXECUTING" || demoStatus === "CONFIRMED"}/></Panel>
    <div className="ops-layout"><Panel title="Virtual node telemetry" subtitle="Configured demo locations, not real-world measurements." className="overflow"><table className="ops-table"><thead><tr><th>Node</th><th>Intersection</th><th>Vehicles</th><th>Queue</th><th>Signal</th><th>Status</th></tr></thead><tbody>{nodes.map((node) => <tr key={node.nodeId} onClick={() => setSelectedId(node.nodeId)} style={{ cursor: "pointer" }}><td><strong><Cpu size={12} /> {node.nodeId}</strong><br /><span className="demo-label">SIMULATION</span></td><td>{node.intersectionId} · {node.name}</td><td>{node.vehicleCount}</td><td>{node.queueLengthMeters} m</td><td>{node.signalState} · {node.signalPhase}</td><td><StatusBadge tone={toneFor(node.status)}>{node.status}</StatusBadge></td></tr>)}</tbody></table></Panel>
      {selected && <Panel title="Node details" subtitle="Virtual IoT node contract"><dl className="ops-detail-list"><dt>NODE</dt><dd>{selected.nodeId}</dd><dt>INTERSECTION</dt><dd>{selected.intersectionId}</dd><dt>MODE</dt><dd>SIMULATION</dd><dt>STATUS</dt><dd><StatusBadge tone={toneFor(selected.status)}>{selected.status}</StatusBadge></dd><dt>VEHICLES</dt><dd>{selected.vehicleCount}</dd><dt>QUEUE</dt><dd>{selected.queueLengthMeters} m</dd><dt>SIGNAL</dt><dd>{selected.signalState}</dd><dt>PHASE</dt><dd>{selected.signalPhase} · {selected.phaseRemainingSeconds}s</dd><dt>CONNECTIVITY</dt><dd><Wifi size={12} /> {selected.connectivity}</dd><dt>SENSOR</dt><dd>SIMULATED</dd><dt>CONTROLLER</dt><dd>SIMULATED</dd><dt>LAST UPDATE</dt><dd>{new Date(selected.lastUpdated).toLocaleTimeString()}</dd></dl></Panel>}
    </div>
  </main></Shell>;
}
