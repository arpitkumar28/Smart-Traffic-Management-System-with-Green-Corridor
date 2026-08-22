export type SignalStatus = "green" | "yellow" | "red" | "priority";

export const stats = [
  { label: "Network Flow", value: "84%", delta: "+12%", tone: "cyan" },
  { label: "Avg Wait Time", value: "42s", delta: "-31%", tone: "lime" },
  { label: "Vehicles/min", value: "1,284", delta: "+8%", tone: "cyan" },
  { label: "CO2 Saved", value: "2.7t", delta: "+18%", tone: "lime" },
];

export const signals = [
  { id: "SIG-01", name: "Civic Center", status: "priority" as SignalStatus, load: 38, eta: "00:22" },
  { id: "SIG-02", name: "Metro Spine", status: "green" as SignalStatus, load: 54, eta: "00:47" },
  { id: "SIG-03", name: "Tech Park", status: "red" as SignalStatus, load: 88, eta: "01:12" },
  { id: "SIG-04", name: "Hospital Link", status: "priority" as SignalStatus, load: 26, eta: "00:34" },
];

export const trafficSeries = [
  { time: "08:00", density: 62, predicted: 66, emergency: 0 },
  { time: "09:00", density: 78, predicted: 82, emergency: 1 },
  { time: "10:00", density: 71, predicted: 68, emergency: 0 },
  { time: "11:00", density: 58, predicted: 61, emergency: 0 },
  { time: "12:00", density: 69, predicted: 74, emergency: 1 },
  { time: "13:00", density: 86, predicted: 80, emergency: 0 },
  { time: "14:00", density: 73, predicted: 70, emergency: 0 },
];

export const alerts = [
  "Ambulance EV-204 detected near Hospital Link",
  "Green corridor active across 4 intersections",
  "Decision Engine rerouted eastbound traffic to reduce conflict",
  "Accident simulation cleared at Tech Park ramp",
];
