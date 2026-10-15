/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          navy: '#10243A',
          DEFAULT: '#10243A',
        },
        secondary: {
          navy: '#1D354D',
          DEFAULT: '#1D354D',
        },
        accent: {
          teal: '#0F9D91',
          hover: '#0B8279',
          DEFAULT: '#0F9D91',
        },
        bg: {
          main: '#F5F7FA',
          subtle: '#EDF2F7',
          card: '#FFFFFF',
        },
        text: {
          primary: '#172B3A',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          subtle: '#EDF2F7',
        },
        status: {
          success: '#15803D',
          warning: '#B45309',
          error: '#B91C1C',
          info: '#1D4ED8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        btn: '10px',
        card: '14px',
        modal: '16px',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(16, 36, 58, 0.04), 0 1px 2px 0 rgba(16, 36, 58, 0.02)',
        card: '0 4px 12px -2px rgba(16, 36, 58, 0.05), 0 2px 6px -1px rgba(16, 36, 58, 0.03)',
        cardHover: '0 12px 24px -4px rgba(16, 36, 58, 0.08), 0 4px 8px -2px rgba(16, 36, 58, 0.03)',
        dropdown: '0 10px 25px -5px rgba(16, 36, 58, 0.1), 0 8px 10px -6px rgba(16, 36, 58, 0.05)',
      },
    },
  },
  plugins: [],
}
