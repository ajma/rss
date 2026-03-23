/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        sidebar: {
          dark: '#1a2332',
          DEFAULT: '#1e2a3a',
          hover: '#263548',
          active: '#2d3f52',
          text: '#8899aa',
          'text-active': '#ffffff',
        },
        icon: {
          bg: '#1a2332',
          active: '#4a9eff',
        },
        accent: {
          blue: '#4a9eff',
          orange: '#e8913a',
        },
        unread: '#4a9eff',
      },
    },
  },
  plugins: [],
};
