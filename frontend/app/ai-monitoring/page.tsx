import { Bot, Camera, ScanLine } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui";

export default function AiMonitoringPage() {
  const modules = ["YOLO vehicle detection", "Lane density calculation", "Emergency classifier", "Signal timing optimizer", "Accident simulation"];
  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6 py-6">
        <h1 className="text-4xl font-black">Traffic Insights Monitoring</h1>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {modules.map((module) => (
            <Card key={module}>
              <Bot className="text-cyan" />
              <h2 className="mt-4 min-h-14 text-lg font-bold">{module}</h2>
              <p className="text-sm text-lime">Online</p>
            </Card>
          ))}
        </div>
        <Card>
          <div className="flex items-center gap-2"><Camera className="text-cyan" /><h2 className="text-xl font-bold">Computer Vision Feed</h2></div>
          <div className="mt-5 grid h-80 place-items-center rounded-lg border border-cyan/20 bg-black/30">
            <ScanLine className="animate-pulse text-lime" size={72} />
          </div>
        </Card>
      </div>
    </Shell>
  );
}
