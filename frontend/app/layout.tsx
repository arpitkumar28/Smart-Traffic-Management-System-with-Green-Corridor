import type { Metadata } from "next";
import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "GREENFLOW — Smart Traffic Orchestration",
  description: "GREENFLOW: Smart traffic orchestration and emergency response control",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
