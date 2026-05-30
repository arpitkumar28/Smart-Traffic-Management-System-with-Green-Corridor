export type DashboardTone = "lime" | "cyan" | "amber";

export type MapCoordinate = [number, number];

export const commandCenterBrand = {
  title: "GreenFlow AI Command Center",
  subtitle: "Smart City operations for traffic, emergency routing, and wire intelligence.",
  status: "Optimal",
  activeEmergencies: 3,
  connectedSources: 12,
  liveWave: "Steady",
  operator: {
    name: "Ava Knight",
    role: "Operations Lead",
    status: "Online",
  },
};

export interface CommandDecision {
  id: string;
  title: string;
  description: string;
  badge: string;
  tone: DashboardTone;
}

export const aiDecisions: CommandDecision[] = [
  {
    id: "01",
    title: "Priority corridor engaged",
    description: "Re-route 4 intersections to accelerate ambulance arrival.",
    badge: "Active",
    tone: "lime",
  },
  {
    id: "02",
    title: "Signal fusion adjustment",
    description: "Balance eastbound traffic across Civic Center and Metro Spine.",
    badge: "Ready",
    tone: "cyan",
  },
  {
    id: "03",
    title: "Sensor anomaly detected",
    description: "Fine-tune congestion forecast on Hospital Link.",
    badge: "Monitor",
    tone: "amber",
  },
];

export const trafficHealth: Array<{ label: string; value: string; detail: string; tone: DashboardTone }> = [
  { label: "City Flow", value: "93%", detail: "Healthy", tone: "lime" },
  { label: "Intersection Load", value: "68%", detail: "Stable", tone: "cyan" },
  { label: "Delay Index", value: "14%", detail: "Improving", tone: "amber" },
];

export const networkStatus = {
  throughput: "97%",
  packetLoss: "0.6%",
  latency: "12ms",
  nodesOnline: 128,
};

export const emergencyStatus = [
  { label: "Ambulance ETA", value: "05:12", detail: "Hospital Link" },
  { label: "Corridor Uptime", value: "99.8%", detail: "Green Corridor" },
  { label: "Response Margin", value: "+18s", detail: "Ahead of target" },
];

export const wireFeed = [
  {
    time: "Just now",
    headline: "Anakin AI flagged an obstructions cluster on East Bay Blvd.",
    level: "Alert",
  },
  {
    time: "2m ago",
    headline: "Wire source 7 synchronized with emergency priority state.",
    level: "Info",
  },
  {
    time: "5m ago",
    headline: "North Rib Road routed around a transient slowdown.",
    level: "Update",
  },
];

export const roadClosures = [
  { id: "C01", label: "Tech Park Ramp", note: "Incident cleanup underway" },
  { id: "C02", label: "South Gate Tunnel", note: "Planned maintenance" },
];

export const weatherAlerts = [
  { id: "W01", condition: "Light showers", impact: "Reduced visibility" },
  { id: "W02", condition: "Breeze", impact: "Signal stability nominal" },
];

export const intelligenceAlerts = [
  { label: "Grid Pressure", value: "Stable" },
  { label: "Priority Drift", value: "0.9%" },
  { label: "AI Confidence", value: "97%" },
];

export const riskLevels = [
  { category: "Critical", value: 72, tone: "bg-amber-500" },
  { category: "High", value: 54, tone: "bg-orange-500" },
  { category: "Medium", value: 30, tone: "bg-cyan-400" },
  { category: "Low", value: 14, tone: "bg-lime-400" },
];

export const timelineEvents = [
  { time: "08:52", event: "Green corridor confirmed for Trauma Unit dispatch." },
  { time: "08:49", event: "AI reduced congestion load on Metro Spine by 12%." },
  { time: "08:45", event: "Anakin wire feed synced 9 cameras with emergency control." },
  { time: "08:42", event: "Weather alert issued for East Bay drizzle." },
];

export const impactMetrics = [
  { label: "Delay Reduction", value: "18%", detail: "via green routing" },
  { label: "CO2 Savings", value: "3.1t", detail: "24-hour estimate" },
  { label: "Priority Score", value: "98", detail: "Emergency throughput" },
];

export const trafficTrend = [
  { time: "08:00", flow: 72, demand: 58 },
  { time: "09:00", flow: 86, demand: 71 },
  { time: "10:00", flow: 79, demand: 63 },
  { time: "11:00", flow: 84, demand: 60 },
  { time: "12:00", flow: 91, demand: 69 },
  { time: "13:00", flow: 89, demand: 73 },
  { time: "14:00", flow: 82, demand: 66 },
];

export const riskDistribution = [
  { label: "City Center", value: 68 },
  { label: "North Sector", value: 35 },
  { label: "South Sector", value: 44 },
  { label: "East Bay", value: 25 },
];

export type MapSensor = {
  id: string;
  label: string;
  position: MapCoordinate;
  status: "priority" | "green" | "red";
};

export const mapSensors: MapSensor[] = [
  { id: "S1", label: "Civic Center", position: [37.788, -122.404], status: "priority" },
  { id: "S2", label: "Metro Spine", position: [37.783, -122.401], status: "green" },
  { id: "S3", label: "Tech Park", position: [37.778, -122.397], status: "red" },
  { id: "S4", label: "Hospital Link", position: [37.775, -122.392], status: "priority" },
];

export const greenCorridorRoute: MapCoordinate[] = [
  [37.790, -122.409],
  [37.784, -122.404],
  [37.780, -122.399],
  [37.776, -122.394],
  [37.770, -122.387],
];
