"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Activity, Ambulance, BarChart3, Bot, Gauge, Home, Map, RadioTower, Settings, ShieldCheck, Cpu, Wifi, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const nav = [
  { href: "/command-center", label: "COMMAND CENTER", icon: Gauge },
  { href: "/map", label: "LIVE OPERATIONS", icon: Map },
  { href: "/analytics", label: "AI INTELLIGENCE", icon: BarChart3 },
  { href: "/wire", label: "WIRE FEED", icon: RadioTower },
  { href: "/emergency", label: "EMERGENCY CONTROL", icon: Ambulance },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className="min-h-screen bg-background text-text-primary font-inter flex flex-col">
      {/* TOP STATUS BAR */}
      <header className="h-14 border-b border-border bg-secondary-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 mr-4">
              <ShieldCheck className="text-primary" size={24} />
              <span className="font-black tracking-tighter text-xl">GREENFLOW AI</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-[10px] font-black tracking-widest text-text-secondary uppercase">
              <div className="flex items-center gap-2 text-success">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                SYSTEM ONLINE
              </div>
              <div className="flex items-center gap-2 text-success">
                <span className="w-2 h-2 rounded-full bg-success" />
                AI ENGINE ACTIVE
              </div>
              <div className="flex items-center gap-2 text-success">
                <span className="w-2 h-2 rounded-full bg-success" />
                SIGNAL NETWORK CONNECTED
              </div>
              <div className="flex items-center gap-2 text-success">
                <span className="w-2 h-2 rounded-full bg-success" />
                EMERGENCY NETWORK READY
              </div>
              <div className="flex items-center gap-2 text-success">
                <span className="w-2 h-2 rounded-full bg-success" />
                WIRE INTELLIGENCE ACTIVE
              </div>
            </div>
          </div>

           <div className="flex items-center gap-4">
             <div className="h-4 w-[1px] bg-border mx-2" />
             <div className="text-[10px] font-black tracking-widest text-text-secondary">12:44:02 UTC</div>
           </div>
        </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR - Only show on dashboard pages */}
        {!isLanding && (
          <aside className="w-20 lg:w-64 border-r border-border bg-secondary-background flex flex-col transition-all duration-300">
            <nav className="flex-1 p-4 space-y-2">
              {nav.map((item) => {
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
            </nav>
            
            <div className="p-4 border-t border-border">
               <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold tracking-wider text-text-secondary hover:bg-white/5 hover:text-text-primary transition-all"
              >
                <Settings size={18} />
                <span className="hidden lg:block">SETTINGS</span>
              </Link>
            </div>
          </aside>
        )}

        <main className={cn(
          "flex-1 overflow-auto bg-grid-pattern",
          isLanding ? "" : "p-6"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
