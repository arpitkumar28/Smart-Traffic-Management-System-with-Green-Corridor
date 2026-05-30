"use client";

import { Shell } from "@/components/Shell";
import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Ambulance, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <Shell>
      <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.1)_0%,transparent_70%)]" />
          
          {/* Subtle moving particles/grid simulation */}
          <motion.div 
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ 
              backgroundImage: "radial-gradient(#00E5FF 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-neon">
                <ShieldCheck size={48} className="text-primary" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-[900] tracking-tighter text-text-primary mb-6 leading-none uppercase">
              SMART CITY <br/>
              <span className="text-primary">TRAFFIC COMMAND CENTER</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-text-secondary mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
              AI-powered traffic intelligence, emergency response optimization, and automated green corridor management.
            </p>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <Link href="/command-center">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 229, 255, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-primary text-background font-black text-lg rounded-xl flex items-center gap-3 transition-all"
                >
                  <Play fill="currentColor" size={20} />
                  LAUNCH COMMAND CENTER
                </motion.button>
              </Link>

              <Link href="/emergency">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-transparent border-2 border-danger text-danger font-black text-lg rounded-xl flex items-center gap-3 hover:bg-danger/10 transition-all"
                >
                  <Ambulance size={20} />
                  SIMULATE EMERGENCY
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* City Skyline Silhouette */}
        <div className="absolute bottom-0 w-full h-32 opacity-20 pointer-events-none z-0">
          <svg viewBox="0 0 1200 120" className="w-full h-full fill-primary/30">
            <path d="M0 120 V80 H20 V100 H40 V60 H60 V90 H80 V40 H100 V100 H120 V70 H140 V100 H160 V30 H180 V100 H200 V85 H220 V100 H240 V50 H260 V100 H280 V75 H300 V100 H320 V20 H340 V100 H360 V65 H380 V100 H400 V45 H420 V100 H440 V80 H460 V100 H480 V55 H500 V100 H520 V35 H540 V100 H560 V70 H580 V100 H600 V25 H620 V100 H640 V60 H660 V100 H680 V40 H700 V100 H720 V85 H740 V100 H760 V50 H780 V100 H800 V75 H820 V100 H840 V20 H860 V100 H880 V65 H900 V100 H920 V45 H940 V100 H960 V80 H980 V100 H1000 V55 H1020 V100 H1040 V35 H1060 V100 H1080 V70 H1100 V100 H1120 V25 H1140 V100 H1160 V60 H1180 V100 H1200 V120 Z" />
          </svg>
        </div>
      </div>
    </Shell>
  );
}
