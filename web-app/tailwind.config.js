/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brasas-rojo': '#b91c1c',
        'brasas-oscuro': '#1a1a1a',
      }
    },
  },
  plugins: [],
}