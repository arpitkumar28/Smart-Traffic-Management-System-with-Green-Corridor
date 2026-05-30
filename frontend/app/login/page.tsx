"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("Traffic Operator");

  return (
    <main className="grid min-h-screen place-items-center bg-citygrid map-grid px-4">
      <Card className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-lime/10 text-lime">
            <ShieldCheck />
          </div>
          <div>
            <h1 className="text-2xl font-black">Secure Admin Access</h1>
            <p className="text-sm text-white/55">Demo login with role-based command access</p>
          </div>
        </div>
        <label className="text-sm text-white/62">Role</label>
        <select className="mt-2 w-full rounded-lg border border-white/10 bg-[#081a20] px-4 py-3 outline-none focus:border-cyan/60" value={role} onChange={(event) => setRole(event.target.value)}>
          <option>Traffic Operator</option>
          <option>Emergency Operator</option>
          <option>City Administrator</option>
        </select>
        <Button className="mt-6 w-full" onClick={() => router.push("/dashboard")}>
          Continue as {role}
        </Button>
      </Card>
    </main>
  );
}
