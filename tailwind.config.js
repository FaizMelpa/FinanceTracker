/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00C896',
        'primary-dark': '#00A87E',
        'primary-light': 'rgba(0,200,150,0.15)',
        expense: '#FF6B6B',
        'expense-light': 'rgba(255,107,107,0.12)',
        income: '#00C896',
        accent: '#FFB347',
        bg: '#0F1117',
        surface: '#1A1D27',
        card: '#1E2235',
        elevated: '#22263A',
        border: '#2A2D3E',
        'text-sec': '#A0A8C0',
        'text-muted': '#5A6080',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
}
