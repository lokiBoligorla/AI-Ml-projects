/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#010607',
        glassBg: 'rgba(4, 21, 23, 0.6)',
        glassBorder: 'rgba(255, 255, 255, 0.12)',
        neonGreen: '#34d399',  // High contrast bright green
        neonBlue: '#38bdf8',   // High contrast sky/oceanic blue
        neonPurple: '#a78bfa',  // High contrast bright purple
        neonPink: '#f472b6',   // High contrast bright pink
        neonYellow: '#fbbf24', // High contrast bright yellow
        neonRed: '#f87171'     // High contrast bright red
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-glow': '0 0 15px rgba(59, 130, 246, 0.5)',
      }
    },
  },
  plugins: [],
}
