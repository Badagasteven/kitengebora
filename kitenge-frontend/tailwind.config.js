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
        primary: {
          DEFAULT: '#111111',
          soft: 'rgba(17, 17, 17, 0.04)',
        },
        accent: {
          DEFAULT: '#FF8C00',
          darker: '#CC7000',
          soft: 'rgba(255, 140, 0, 0.1)',
        },
        danger: {
          DEFAULT: '#ff0000',
          soft: 'rgba(255, 0, 0, 0.1)',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'lg': '14px',
        'md': '8px',
      },
      boxShadow: {
        'soft': '0 16px 40px rgba(15, 23, 42, 0.08)',
        'subtle': '0 4px 12px rgba(17, 17, 17, 0.05)',
      },
    },
  },
  plugins: [],
}

