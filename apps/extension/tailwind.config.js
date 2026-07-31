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
    extend: {
      animation: {
        // Timing/easing come from shared CSS vars (--ease-out, --duration-base)
        // so curves stay in one place and never drift back to ease-in.
        'slide-in': 'slideIn var(--duration-base) var(--ease-out) forwards',
        'slide-in-up': 'slideUp var(--duration-base) var(--ease-out) forwards',
        'fade-in': 'fadeIn var(--duration-base) var(--ease-out) forwards',
        'stagger-in': 'staggerIn var(--duration-base) var(--ease-out) forwards',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        staggerIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
