/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF4FF",
          100: "#DBE6FE",
          200: "#BCD0FE",
          300: "#8DAFFC",
          400: "#5A87F8",
          500: "#2563EB",
          600: "#1D4FD8",
          700: "#1A3FB0",
          800: "#1A368B",
          900: "#1A306E",
        },
        success: { DEFAULT: "#22C55E", 50: "#EFFDF4", 100: "#D6FAE3" },
        warning: { DEFAULT: "#F59E0B", 50: "#FFFAEB", 100: "#FEF0C7" },
        error: { DEFAULT: "#EF4444", 50: "#FEF2F2", 100: "#FEE2E2" },
        surface: { bg: "#F8FAFC", card: "#FFFFFF" },
        ink: { 900: "#0F172A", 700: "#334155", 500: "#64748B", 300: "#CBD5E1" },
      },
      borderRadius: { xl2: "20px", card: "20px", pill: "999px" },
      fontFamily: {
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)",
        softer: "0 1px 1px rgba(15, 23, 42, 0.03), 0 2px 8px -2px rgba(15, 23, 42, 0.06)",
        glow: "0 0 0 1px rgba(37, 99, 235, 0.08), 0 8px 30px -8px rgba(37, 99, 235, 0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(34,197,94,0.4)" },
          "70%": { boxShadow: "0 0 0 8px rgba(34,197,94,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
        pulseRing: "pulseRing 2s infinite",
      },
    },
  },
  plugins: [],
};
