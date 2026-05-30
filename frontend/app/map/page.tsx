"use client";

import dynamic from "next/dynamic";
import { Shell } from "@/components/Shell";

// Dynamically import the LiveMap component with SSR disabled
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-7rem)] items-center justify-center rounded-lg border border-cyan/15 bg-[#07171b] text-white/50">
      Loading Live Map...
    </div>
  ),
});

export default function MapPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-4 py-6">
        <h1 className="text-4xl font-black text-white">Live City Map</h1>
        <LiveMap />
      </div>
    </Shell>
  );
}
