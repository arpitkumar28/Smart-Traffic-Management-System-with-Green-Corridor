"use client";

import { Shell } from "@/components/Shell";
import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Ambulance, ShieldCheck, Zap, Cpu, Activity } from "lucide-react";

export default function LandingPage() {
  return (
    <Shell>
      <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center overflow-hidden bg-background">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(25,210,124,0.06)_0%,transparent_70%)]" />
          
          {/* Subtle moving particles */}
          <motion.div 
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{ 
              duration: 40, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{ 
              backgroundImage: "radial-gradient(#19D27C 1px, transparent 1px)",
              backgroundSize: "60px 60px"
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-10">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative p-6 bg-panel border border-primary/30 shadow-neon rounded-2xl">
                  <ShieldCheck size={64} className="text-primary" />
                </div>
              </div>
            </div>
            
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-text mb-6 leading-none uppercase">
              GREENFLOW
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl font-semibold tracking-wide text-text-secondary mb-16 max-w-4xl mx-auto leading-relaxed">
              Smart Traffic Orchestration Platform for Emergency Response and Congestion Prediction
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-20">
              <Link href="/emergency">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(25, 210, 124, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="px-12 py-6 bg-primary text-background font-black text-lg rounded-xl flex items-center gap-3 transition-all border border-primary/40 shadow-lg"
                >
                  <Ambulance size={24} />
                  START LIVE EMERGENCY DEMO
                </motion.button>
              </Link>

              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(25, 210, 124, 0.15)" }}
                  whileTap={{ scale: 0.98 }}
                  className="px-12 py-6 bg-panel border-2 border-primary/30 text-primary font-black text-lg rounded-xl flex items-center gap-3 hover:bg-panel-alt transition-all"
                >
                  <Play fill="currentColor" size={20} />
                  COMMAND CENTER
                </motion.button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto">
                {[
                    { label: "Efficiency", val: "+42%", icon: Zap, color: "text-primary" },
                    { label: "Response", val: "-6.2m", icon: Activity, color: "text-success" },
                    { label: "Edge Nodes", val: "1,240", icon: Cpu, color: "text-warning" },
                    { label: "Uptime", val: "99.9%", icon: ShieldCheck, color: "text-primary" }
                ].map((stat, i) => (
                    <div key={i} className="bg-panel border border-border rounded-xl p-6 backdrop-blur-sm hover:border-primary/20 transition-colors">
                        <div className="flex items-center gap-2 mb-2 justify-center">
                            <stat.icon size={16} className={stat.color} />
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className={`text-3xl font-black ${stat.color}`}>{stat.val}</div>
                    </div>
                ))}
            </div>
          </motion.div>
        </div>

        {/* City Skyline Silhouette */}
        <div className="absolute bottom-0 w-full h-48 opacity-8 pointer-events-none z-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-primary">
            <path d="M0 120 V80 H20 V100 H40 V60 H60 V90 H80 V40 H100 V100 H120 V70 H140 V100 H160 V30 H180 V100 H200 V85 H220 V100 H240 V50 H260 V100 H280 V75 H300 V100 H320 V20 H340 V100 H360 V65 H380 V100 H400 V45 H420 V100 H440 V80 H460 V100 H480 V55 H500 V100 H520 V35 H540 V100 H560 V70 H580 V100 H600 V25 H620 V100 H640 V60 H660 V100 H680 V40 H700 V100 H720 V85 H740 V100 H760 V50 H780 V100 H800 V75 H820 V100 H840 V20 H860 V100 H880 V65 H900 V100 H920 V45 H940 V100 H960 V80 H980 V100 H1000 V55 H1020 V100 H1040 V35 H1060 V100 H1080 V70 H1100 V100 H1120 V25 H1140 V100 H1160 V60 H1180 V100 H1200 V120 Z" />
          </svg>
        </div>
      </div>
    </Shell>
  );
}
