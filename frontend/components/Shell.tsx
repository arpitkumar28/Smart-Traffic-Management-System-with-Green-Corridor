"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Activity, Ambulance, BarChart3, Bot, Gauge, Home, Map, RadioTower, Settings, ShieldCheck } from "lucide-react";
import { cn } from "@/components/ui";

const nav = [
  { href: "/", label: "Landing", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/map", label: "Live Map", icon: Map },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/emergency", label: "Emergency", icon: Ambulance },
  { href: "/signals", label: "Signals", icon: Activity },
  { href: "/ai-monitoring", label: "AI Monitor", icon: Bot },
  { href: "/wire", label: "Wire Intel", icon: RadioTower },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-citygrid map-grid">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/10 bg-ink/80 p-5 backdrop-blur-xl lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg border border-lime/30 bg-lime/10 text-lime shadow-green">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-lg font-black">GreenFlow AI</div>
            <div className="text-xs text-cyan/70">Smart corridor command</div>
          </div>
        </div>
        <nav className="space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white",
                  active && "bg-cyan/10 text-cyan shadow-neon",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="px-4 py-4 lg:ml-72 lg:px-8">{children}</main>
    </div>
  );
}
