/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        salon: {
          primary: "#E11D48",     // Rose Gold
          accent: "#F9A8D4",      // Blush Pink
          beige: "#FDF6EC",       // Champagne Beige
          dark: "#1F2937",        // Deep Charcoal
          light: "#FFFFFF",       // Soft White
        },
      },
    },
  },
  plugins: [],
}
