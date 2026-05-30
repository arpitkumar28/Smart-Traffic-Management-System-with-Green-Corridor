import { CheckCircle2, RadioTower } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui";

const sources = ["Traffic Reports", "Emergency Feeds", "Weather Data", "Road Conditions", "Public Alerts"];

export default function WirePage() {
  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6 py-6">
        <h1 className="text-4xl font-black">Wire Intelligence Dashboard</h1>
        <Card>
          <div className="flex items-center gap-3">
            <RadioTower className="text-cyan" />
            <div>
              <h2 className="text-xl font-bold">Connected Intelligence Sources</h2>
              <p className="text-sm text-white/55">Mock synchronized external feeds for a smooth demo.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {sources.map((source) => (
              <div key={source} className="rounded-lg border border-lime/20 bg-lime/10 p-4">
                <CheckCircle2 className="text-lime" />
                <p className="mt-3 font-semibold">{source}</p>
                <p className="mt-1 text-xs text-white/50">Synced 12s ago</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
