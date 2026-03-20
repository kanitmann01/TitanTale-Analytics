import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ttl: {
          gold: "#D4AF37",
          "gold-dim": "#a68a2a",
          "gold-light": "#e8cc6e",
          bronze: "#CD7F32",
          navy: "#0c141e",
          raised: "#131f2e",
          slate: "#1a2b3d",
          surface: "#1f3347",
          border: "#1e3148",
          "border-subtle": "#162538",
          accent: "#4a90c4",
          "accent-dim": "#345f80",
          win: "#5cb85c",
          loss: "#c75050",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      textColor: {
        primary: "#e4dfd8",
        secondary: "#b8c4d0",
        muted: "#6b7f94",
      },
    },
  },
  plugins: [],
};

export default config;
