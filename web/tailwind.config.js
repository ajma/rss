/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        sidebar: {
          border: 'var(--sidebar-border)',
          DEFAULT: 'var(--sidebar-bg)',
          hover: 'var(--sidebar-hover)',
          active: 'var(--sidebar-active)',
          text: 'var(--sidebar-text)',
          'text-active': 'var(--sidebar-text-active)',
        },
        icon: {
          bg: 'var(--icon-bg)',
          active: '#4a9eff',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
          border: 'var(--surface-border)',
        },
        content: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
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
