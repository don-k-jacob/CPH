import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        base: "#f7f1e4",
        ink: "#1f1a17",
        accent: "#6f1d1b",
        "accent-hover": "#561514",
        accentSoft: "#f2e0cf",
        mint: "#2f7d5e",
        gold: "#b98a2f",
        stone: "#e7dcc8"
      },
      boxShadow: {
        card: "0 6px 22px rgba(22, 18, 14, 0.08), 0 2px 6px rgba(22, 18, 14, 0.05)",
        "card-hover": "0 14px 40px rgba(22, 18, 14, 0.12), 0 4px 10px rgba(22, 18, 14, 0.07)",
        glow: "0 0 0 3px rgba(111, 29, 27, 0.2)"
      },
      transitionDuration: {
        200: "200ms",
        300: "300ms"
      }
    }
  },
  plugins: []
};

export default config;
