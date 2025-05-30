import shadcnPreset from "./preset"

/** @type {import('tailwindcss').Config} */
export default {
  presets: [shadcnPreset],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} 