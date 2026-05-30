import { LiveMap } from "@/components/LiveMap";
import { Shell } from "@/components/Shell";

export default function MapPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-4 py-6">
        <h1 className="text-4xl font-black">Live City Map</h1>
        <LiveMap />
      </div>
    </Shell>
  );
}
