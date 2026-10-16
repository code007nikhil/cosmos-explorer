import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { void: "#05070f", navy: "#0b1226", ion: "#3b82f6", plasma: "#8b5cf6", aqua: "#22d3ee" } } },
  plugins: [],
};
export default config;
