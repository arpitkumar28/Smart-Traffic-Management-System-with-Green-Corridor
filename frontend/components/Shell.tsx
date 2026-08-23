"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Activity, AlertCircle, Ambulance, BarChart3, Gauge, Map, MapPinned, RadioTower, Route, Settings, Cpu, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SystemStatus } from "@/components/SystemStatus";

const navGroups = [
  { label: "OPERATIONS", items: [{ href: "/dashboard", label: "COMMAND CENTER", icon: Gauge }, { href: "/live-operations", label: "LIVE OPERATIONS", icon: Map }, { href: "/traffic-network", label: "NETWORK HEALTH", icon: MapPinned }] },
  { label: "EMERGENCY", items: [{ href: "/green-corridors", label: "ACTIVE CORRIDORS", icon: Route }, { href: "/emergency", label: "VEHICLES", icon: Ambulance }, { href: "/live-operations", label: "ALERTS & INCIDENTS", icon: AlertCircle }] },
  { label: "INTELLIGENCE", items: [{ href: "/traffic-insights", label: "TRAFFIC INSIGHTS", icon: BarChart3 }, { href: "/ai-monitoring", label: "PREDICTIONS", icon: TrendingUp }, { href: "/analytics", label: "ANALYTICS", icon: TrendingUp }] },
  { label: "INFRASTRUCTURE", items: [{ href: "/signal-sync", label: "SIGNAL SYNC", icon: RadioTower }, { href: "/edge-network", label: "IOT TRAFFIC NETWORK", icon: Cpu }, { href: "/lane-management", label: "LANE MANAGEMENT", icon: Activity }] },
  { label: "ADMINISTRATION", items: [{ href: "/settings", label: "SETTINGS", icon: Settings }, { href: "/live-operations", label: "AUDIT LOG", icon: Activity }] },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isMapFirst = pathname?.startsWith("/map") || pathname?.startsWith("/command-center");

  return (
    <div className="min-h-screen bg-background text-text-primary font-inter flex flex-col">
      {/* TOP STATUS BAR */}
      <header className="min-h-[3.5rem] h-auto py-2 border-b border-border bg-secondary-background/80 backdrop-blur-md flex flex-wrap items-center justify-between px-6 sticky top-0 z-50 gap-4">
          <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 mr-4">
              <Image src="/greenflow-logo.png" alt="GreenFlow" width={36} height={36} priority className="h-9 w-9 rounded-full object-contain" />
              <span className="font-black tracking-tighter text-xl">GREENFLOW</span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end flex-wrap gap-3 text-[9px] font-black tracking-widest text-text-secondary uppercase">
            <div className="flex items-center gap-2 text-success bg-success/5 px-2 py-1 rounded-full border border-success/10">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <SystemStatus compact />
            </div>
            <div className="flex items-center gap-2 text-success bg-success/5 px-2 py-1 rounded-full border border-success/10">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              DECISION ENGINE
            </div>
            <div className="flex items-center gap-2 text-success bg-success/5 px-2 py-1 rounded-full border border-success/10">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              SIGNAL NETWORK CONNECTED
            </div>
            <div className="flex items-center gap-2 text-success bg-success/5 px-2 py-1 rounded-full border border-success/10">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              EMERGENCY NETWORK READY
            </div>
            {!isLanding && <div className="flex items-center gap-2 text-warning bg-warning/5 px-2 py-1 rounded-full border border-warning/20" aria-label="Demo mode">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              DEMO MODE
            </div>}
            
             <div className="flex items-center gap-4 ml-2">
               <div className="h-4 w-[1px] bg-border" />
               <div className="text-[10px] font-black tracking-widest text-text-secondary">12:44:02 UTC</div>
             </div>
          </div>
        </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR - Only show on dashboard pages */}
        {!isLanding && (
          <aside className="w-20 lg:w-64 border-r border-border bg-secondary-background flex flex-col transition-all duration-300">
            <nav className="flex-1 p-4 space-y-2">
              {navGroups.map((group) => <div key={group.label} className="space-y-2">
                <p className="hidden px-4 pt-3 text-[9px] font-black tracking-[0.2em] text-text-secondary/60 lg:block">{group.label}</p>
                {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold tracking-wider transition-all duration-200",
                      active 
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-neon" 
                        : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                    )}
                  >
                    <Icon size={18} className={cn(active ? "text-primary" : "text-text-secondary")} />
                    <span className="hidden lg:block">{item.label}</span>
                  </Link>
                );
                })}
              </div>)}
            </nav>
            
          </aside>
        )}

        <main className={cn(
          "flex-1 overflow-auto bg-grid-pattern",
          isLanding ? "" : isMapFirst ? "p-3 lg:p-6" : "p-6"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
