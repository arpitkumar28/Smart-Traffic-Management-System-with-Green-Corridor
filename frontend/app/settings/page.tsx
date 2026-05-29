import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui";

export default function SettingsPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-5xl space-y-6 py-6">
        <h1 className="text-4xl font-black">Settings</h1>
        <Card>
          <h2 className="text-xl font-bold">System Configuration</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {["Eco traffic mode", "Manual override", "Emergency auto-priority", "Citizen alerts"].map((item) => (
              <label key={item} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                <span>{item}</span>
                <input type="checkbox" defaultChecked className="h-5 w-5 accent-lime" />
              </label>
            ))}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
