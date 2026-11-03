import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './views/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          deep: '#160829',
          dark: '#220d3f',
          violet: '#7c3aed',
          'violet-hover': '#6d28d9',
          indigo: '#4f46e5',
          'indigo-dark': '#3730a3',
          night: '#0b0f19',
          fuchsia: '#ec4899',
          coral: '#f97316',
        },
      },
    },
  },
  plugins: [],
};

export default config;
