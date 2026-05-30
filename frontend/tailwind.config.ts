import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#050B12",
        "secondary-background": "#07171B",
        card: "#0D1B24",
        border: "rgba(0,229,255,0.15)",
        primary: "#00E5FF",
        success: "#00FF88",
        warning: "#FFC857",
        danger: "#FF5252",
        "text-primary": "#FFFFFF",
        "text-secondary": "rgba(255,255,255,0.65)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 229, 255, 0.3)",
        "neon-success": "0 0 20px rgba(0, 255, 136, 0.3)",
        "neon-danger": "0 0 20px rgba(255, 82, 82, 0.3)",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(to right, rgba(0, 229, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 229, 255, 0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
