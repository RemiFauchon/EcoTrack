/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Schibsted Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0e1f17',
        paper: '#f4f3ec',
        brand: {
          50: '#e9f6ee',
          100: '#cdebd9',
          200: '#9ed7b5',
          300: '#66bd8c',
          400: '#33a169',
          500: '#168650',
          600: '#0f6b41',
          700: '#0d5435',
          800: '#0d402a',
          900: '#0e2a1d',
        },
        status: {
          ok: '#1f9d57',
          warn: '#e08700',
          crit: '#d6453d',
          unknown: '#9aa39d',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(14,31,23,0.04), 0 8px 24px -12px rgba(14,31,23,0.15)',
        lift: '0 10px 40px -16px rgba(14,31,23,0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
