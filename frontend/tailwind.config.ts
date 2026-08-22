import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#03110F",
        "background-alt": "#061713",
        panel: "#0A211B",
        "panel-alt": "#0E2922",
        primary: "#19D27C",
        "primary-alt": "#35E68D",
        teal: "#238F7C",
        text: "#F1F5F2",
        "text-secondary": "#A6B3AD",
        muted: "#6D7E76",
        warning: "#D7A93E",
        critical: "#E95B5B",
        success: "#31D77B",
        danger: "#E95B5B",
        border: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      spacing: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
      boxShadow: {
        soft: "0 8px 30px rgba(3,7,18,0.45)",
        elevated: '0 6px 18px rgba(0,0,0,0.5)',
        neon: '0 0 20px rgba(25, 210, 124, 0.15)',
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
