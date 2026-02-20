import type { Config } from 'tailwindcss';
import uiPreset from '@fitted-in/ui/tailwind.config';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [uiPreset],
  theme: {
    extend: {},
  },
};
export default config;
