/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          light: '#ffffff',
          dark: '#1f1f1f',
        },
        panel: {
          light: '#ffffff',
          dark: '#252526',
        },
        border: {
          light: '#e5e7eb',
          dark: '#2d2d2d',
        },
        text: {
          light: '#111827',
          dark: '#d4d4d4',
        },
        muted: {
          light: '#6b7280',
          dark: '#a1a1aa',
        },
      },
    },
  },
  plugins: [],
};
