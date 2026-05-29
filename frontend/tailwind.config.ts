import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#061014",
        panel: "rgba(11, 25, 31, 0.76)",
        cyan: "#18f2ff",
        lime: "#8cff5a",
        ember: "#ff7a45",
      },
      boxShadow: {
        neon: "0 0 24px rgba(24, 242, 255, 0.28)",
        green: "0 0 28px rgba(140, 255, 90, 0.24)",
      },
      backgroundImage: {
        citygrid:
          "linear-gradient(rgba(24,242,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(140,255,90,.07) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
