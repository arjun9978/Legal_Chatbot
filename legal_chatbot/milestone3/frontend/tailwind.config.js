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
        dark: {
          bg: '#0B1220',
          surface: '#1A2332',
          hover: '#2A3544',
          border: '#3A4556',
          text: '#E8EAF0',
          muted: '#94A3B8'
        },
        light: {
          bg: '#F5F5F0',
          surface: '#FFFFFF',
          hover: '#F0EFE8',
          border: '#D4D2C8',
          text: '#1A1A1A',
          muted: '#6B6B5F'
        },
        primary: {
          DEFAULT: '#1E3A5F',
          hover: '#172E4A',
          light: '#2A4A75'
        },
        accent: {
          gold: '#9C8147',
          'gold-muted': '#7A6838'
        },
        legal: {
          navy: '#1E3A5F',
          slate: '#475569',
          charcoal: '#2D3748',
          border: '#556B8A'
        }
      },
      fontFamily: {
        serif: ['Libre Baskerville', 'Georgia', 'serif'],
        body: ['Source Serif 4', 'Georgia', 'serif'],
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      lineHeight: {
        'legal': '1.7'
      }
    },
  },
  plugins: [],
}
