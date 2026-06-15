import type { Config } from "tailwindcss";

// Operator / intelligence palette, pulled verbatim from ref.html :root.
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        op: {
          bg: "#08090b",
          surface: "#101318",
          border: "#20232b",
          "border-bright": "#34384180",
          text: "#e9eaed",
          muted: "#888d99",
          dim: "#565b67",
          accent: "#ffb454",
          "accent-hi": "#ffc77d",
          live: "#74cf86",
          cyan: "#69c2d6",
        },
      },
      maxWidth: {
        wrap: "1120px",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
