"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@greenflow.ai");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  async function login() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch {
      setError("Firebase login failed. Check credentials or use demo mode after setup.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-citygrid map-grid px-4">
      <Card className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-lime/10 text-lime">
            <ShieldCheck />
          </div>
          <div>
            <h1 className="text-2xl font-black">Admin Login</h1>
            <p className="text-sm text-white/55">Secure Firebase command access</p>
          </div>
        </div>
        <label className="text-sm text-white/62">Email</label>
        <input className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan/60" value={email} onChange={(event) => setEmail(event.target.value)} />
        <label className="mt-4 block text-sm text-white/62">Password</label>
        <input className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan/60" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error ? <p className="mt-4 text-sm text-ember">{error}</p> : null}
        <Button className="mt-6 w-full" onClick={() => void login()}>
          Enter Dashboard
        </Button>
      </Card>
    </main>
  );
}
