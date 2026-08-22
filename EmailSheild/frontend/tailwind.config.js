/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#0b0f19",
          card: "#121b2d",
          panel: "#1a2436",
          border: "#27354a",
          text: "#f8fafc",
          muted: "#94a3b8",
          safe: "#10b981",
          spam: "#f59e0b",
          phish: "#ef4444",
          cyan: "#06b6d4",
          violet: "#8b5cf6"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-safe': '0 0 15px rgba(16, 185, 129, 0.25)',
        'neon-spam': '0 0 15px rgba(245, 158, 11, 0.25)',
        'neon-phish': '0 0 15px rgba(239, 68, 68, 0.25)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.25)',
      }
    },
  },
  plugins: [],
}
