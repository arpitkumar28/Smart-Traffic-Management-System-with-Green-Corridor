import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui";
import { trafficSeries } from "@/lib/data";

export default function AnalyticsPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6 py-6">
        <h1 className="text-4xl font-black">Analytics</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <Card><p className="text-white/55">Peak Congestion</p><b className="mt-3 block text-4xl text-cyan">13:00</b></Card>
          <Card><p className="text-white/55">Emergency Response Gain</p><b className="mt-3 block text-4xl text-lime">38%</b></Card>
          <Card><p className="text-white/55">Eco Mode Savings</p><b className="mt-3 block text-4xl text-lime">2.7t</b></Card>
        </div>
        <Card>
          <h2 className="mb-4 text-xl font-bold">Daily Vehicle Report</h2>
          <div className="grid gap-3 md:grid-cols-7">
            {trafficSeries.map((item) => (
              <div key={item.time} className="rounded-lg bg-white/5 p-4">
                <p className="text-sm text-white/50">{item.time}</p>
                <p className="mt-2 text-2xl font-black">{item.density}%</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
