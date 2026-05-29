import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui";
import { signals } from "@/lib/data";

export default function SignalsPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6 py-6">
        <h1 className="text-4xl font-black">Traffic Signal Management</h1>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {signals.map((signal) => (
            <Card key={signal.id}>
              <p className="text-sm text-white/48">{signal.id}</p>
              <h2 className="mt-2 text-xl font-bold">{signal.name}</h2>
              <div className="mt-5 flex items-center justify-between">
                <span className="rounded-lg border border-lime/25 bg-lime/10 px-3 py-2 text-sm text-lime">{signal.status}</span>
                <b>{signal.load}% load</b>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-cyan" style={{ width: `${signal.load}%` }} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Shell>
  );
}
