import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { HTMLAttributes, ButtonHTMLAttributes } from "react";

export function cn(...inputs: Array<string | undefined | false>) {
  return twMerge(clsx(inputs));
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass rounded-lg p-5 shadow-neon", className)} {...props} />;
}

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm font-semibold text-cyan transition hover:bg-cyan/20",
        className,
      )}
      {...props}
    />
  );
}
