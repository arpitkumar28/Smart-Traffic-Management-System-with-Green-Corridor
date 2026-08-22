import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ index, title, subtitle, actions }: { index: string; title: string; subtitle: string; actions?: ReactNode }) {
  return <header className="ops-header"><div><p>{index} · Connected traffic orchestration</p><h1>{title}</h1><span>{subtitle}</span></div>{actions && <div className="ops-actions">{actions}</div>}</header>;
}

export function Panel({ title, subtitle, children, className }: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
  return <section className={cn("ops-panel", className)}><header><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></header>{children}</section>;
}

export function MetricCard({ label, value, note, tone = "green" }: { label: string; value: string | number; note?: string; tone?: "green" | "amber" | "red" | "plain" }) {
  return <div className="ops-metric"><small>{label}</small><strong className={tone}>{value}</strong>{note && <span>{note}</span>}</div>;
}

export function StatusBadge({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "amber" | "red" | "plain" }) { return <span className={`ops-badge ${tone}`}>{children}</span>; }

export function Meter({ value, tone = "green" }: { value: number; tone?: "green" | "amber" | "red" }) { return <div className="ops-meter"><i className={tone} style={{ width: `${Math.max(0, Math.min(100, value))}%` }}/></div>; }
