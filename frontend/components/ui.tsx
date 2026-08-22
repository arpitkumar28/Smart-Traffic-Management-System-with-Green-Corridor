"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React, { type HTMLAttributes, type ButtonHTMLAttributes, useEffect } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card rounded-lg p-4", className)} {...props} />;
}

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "btn btn-ghost",
        className,
      )}
      {...props}
    />
  );
}

export function StatusBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black", className)}>
      {children}
    </span>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("gf-panel p-4", className)}>
      {children}
    </div>
  );
}

export function CommandButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-3 rounded-lg px-4 py-2 font-black uppercase tracking-wider text-sm transition",
        "border border-white/6 bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)]",
        className
      )}
    >
      {children}
    </button>
  );
}

export function ConfirmationDialog({ open, title, description, onConfirm, onCancel }: {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md">
        <div className="gf-panel p-6">
          <h3 className="text-lg font-black mb-2">{title}</h3>
          {description && <p className="text-sm text-[var(--gf-text-secondary)] mb-4">{description}</p>}
          <div className="flex gap-3 justify-end">
            <button onClick={onCancel} className="px-4 py-2 rounded bg-white/5 border">Cancel</button>
            <button onClick={onConfirm} className="px-4 py-2 rounded bg-[var(--gf-primary)] text-black font-black">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center opacity-60">
      <div className="w-14 h-14 rounded-lg bg-white/3 mb-4 flex items-center justify-center">—</div>
      <h4 className="font-black text-lg mb-1">{title}</h4>
      {hint && <p className="text-sm text-[var(--gf-text-secondary)]">{hint}</p>}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-6 px-4">
      <div className="h-8 w-8 rounded-full border-4 border-[var(--gf-primary)] border-t-transparent animate-spin" />
      <div className="text-sm font-black uppercase text-[var(--gf-text-secondary)]">{label}...</div>
    </div>
  );
}
