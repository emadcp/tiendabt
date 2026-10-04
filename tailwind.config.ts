import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: "#f0fdf4",
          600: "#16a34a",
        },
        blue: {
          50: "#eff6ff",
          100: "#dbeafe",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        red: {
          50: "#fef2f2",
          600: "#dc2626",
        },
        orange: {
          50: "#fff7ed",
          600: "#ea580c",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
