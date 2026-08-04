/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        'bg-elev': 'rgb(var(--bg-elev) / <alpha-value>)',
        'bg-soft': 'rgb(var(--bg-soft) / <alpha-value>)',
        app: 'rgb(var(--text) / <alpha-value>)',
        'app-soft': 'rgb(var(--text-soft) / <alpha-value>)',
        'app-faint': 'rgb(var(--text-faint) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'primary-soft': 'rgb(var(--primary-soft) / <alpha-value>)',
        'primary-tint': 'rgb(var(--primary-tint) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        borderapp: 'rgb(var(--border) / <alpha-value>)',
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px -4px rgb(0 0 0 / 0.08)',
        'card-hover': '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 24px 48px -12px rgb(0 0 0 / 0.16)',
      },
      maxWidth: { '8xl': '88rem' },
    },
  },
  plugins: [],
};
