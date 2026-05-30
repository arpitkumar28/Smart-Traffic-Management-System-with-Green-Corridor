"use client";

import { Ambulance, Siren, TimerReset } from "lucide-react";
import type { ReactNode } from "react";
import { Shell } from "@/components/Shell";
import { Button, Card } from "@/components/ui";
import { triggerEmergencyCorridor } from "@/lib/api";

export default function EmergencyPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6 py-6">
        <h1 className="text-4xl font-black">Emergency Control</h1>
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <Card>
            <Siren className="mb-4 text-ember" size={42} />
            <h2 className="text-2xl font-black">Green Corridor AI</h2>
            <p className="mt-3 text-white/58">Activate priority routing for ambulance EV-204 and synchronize the nearest intersections in realtime.</p>
            <Button className="mt-6 border-lime/40 bg-lime/10 text-lime" onClick={() => void triggerEmergencyCorridor()}>
              <Ambulance size={18} />
              Activate Ambulance Mode
            </Button>
          </Card>
          <Card>
            <h2 className="text-xl font-bold">Emergency Analytics</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Panel icon={<TimerReset />} label="ETA" value="07:00" />
              <Panel icon={<Ambulance />} label="Signals Cleared" value="4" />
              <Panel icon={<Siren />} label="Time Saved" value="03:30" />
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}

function Panel({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-lg border border-white/10 bg-white/5 p-5 text-lime">{icon}<p className="mt-4 text-sm text-white/55">{label}</p><b className="text-3xl">{value}</b></div>;
}
