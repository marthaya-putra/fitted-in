/** @type {import('tailwindcss').Config} */
import uiPreset from '@fitted-in/ui/tailwind.config';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [uiPreset],
  theme: {
    extend: {},
  },
  plugins: [],
}
